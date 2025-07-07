-- Drop table if it exists (for clean development)
DROP TABLE IF EXISTS processed_invoices;

-- Create table to store OCR-processed invoice data
CREATE TABLE processed_invoices (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    invoice_id TEXT NOT NULL UNIQUE, -- The OCR-generated ID
    
    -- Basic invoice information
    invoice_number TEXT,
    invoice_date DATE,
    due_date DATE,
    
    -- Supplier information
    supplier_name TEXT,
    supplier_nif TEXT,
    supplier_address TEXT,
    
    -- Financial data
    subtotal NUMERIC(12, 2),
    vat_rate NUMERIC(5, 4), -- e.g., 0.21 for 21%
    vat_amount NUMERIC(12, 2),
    total_amount NUMERIC(12, 2),
    
    -- Tax categorization
    tax_category_type TEXT NOT NULL CHECK (tax_category_type IN ('expense', 'income')),
    tax_category TEXT NOT NULL, -- ExpenseCategory or IncomeCategory
    tax_subcategory TEXT,
    deductibility_percentage INTEGER DEFAULT 100 CHECK (deductibility_percentage BETWEEN 0 AND 100),
    
    -- Quarterly/Annual reporting codes
    quarterly_reporting_code TEXT, -- e.g., 'M303_C28'
    annual_reporting_code TEXT,    -- e.g., 'IRPF_GASTOS_PROF'
    
    -- Processing metadata
    confidence_score NUMERIC(4, 3) CHECK (confidence_score BETWEEN 0 AND 1),
    processing_status TEXT DEFAULT 'extracted' CHECK (processing_status IN ('extracted', 'validated', 'categorized', 'filed')),
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- File information
    original_filename TEXT,
    file_size INTEGER,
    file_type TEXT,
    
    -- Full OCR data as JSON for complete record
    invoice_data JSONB NOT NULL,
    
    -- Time period for reporting
    quarter TEXT NOT NULL, -- 'T1', 'T2', 'T3', 'T4'
    year INTEGER NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX idx_processed_invoices_user_period ON processed_invoices (user_id, year DESC, quarter);
CREATE INDEX idx_processed_invoices_category ON processed_invoices (tax_category_type, tax_category);
CREATE INDEX idx_processed_invoices_status ON processed_invoices (processing_status);
CREATE INDEX idx_processed_invoices_confidence ON processed_invoices (confidence_score);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_processed_invoices_updated_at 
    BEFORE UPDATE ON processed_invoices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample OCR-processed data
INSERT INTO processed_invoices (
    user_id, invoice_id, invoice_number, invoice_date, supplier_name, supplier_nif,
    subtotal, vat_rate, vat_amount, total_amount,
    tax_category_type, tax_category, deductibility_percentage,
    quarterly_reporting_code, annual_reporting_code,
    confidence_score, processing_status,
    original_filename, file_size, file_type,
    quarter, year,
    invoice_data
) VALUES
    (
        'user_123', 
        'ocr_1704639600_abc123', 
        'TEL-2024-001', 
        '2024-01-15',
        'Telefónica España S.A.U.',
        'A82018474',
        45.45,
        0.21,
        9.55,
        55.00,
        'expense',
        'telecommunications',
        100,
        'M303_C28',
        'IRPF_GASTOS_DEDUCIBLES',
        0.94,
        'validated',
        'factura_telefonica_enero.pdf',
        245760,
        'application/pdf',
        'T1',
        2024,
        '{"id": "ocr_1704639600_abc123", "extractedAt": "2024-01-15T10:30:00Z", "confidence": 0.94, "invoiceNumber": "TEL-2024-001", "supplierName": "Telefónica España S.A.U.", "items": [{"description": "Línea móvil empresarial", "totalPrice": 45.45}]}'::jsonb
    ),
    (
        'user_123', 
        'ocr_1704726000_def456', 
        'CONS-2024-002', 
        '2024-01-20',
        'Consultoría Fiscal Pro S.L.',
        'B87654321',
        500.00,
        0.21,
        105.00,
        605.00,
        'expense',
        'professional_services',
        100,
        'M303_C28',
        'IRPF_GASTOS_PROF',
        0.91,
        'categorized',
        'consultoria_fiscal_enero.jpg',
        1024000,
        'image/jpeg',
        'T1',
        2024,
        '{"id": "ocr_1704726000_def456", "extractedAt": "2024-01-20T14:15:00Z", "confidence": 0.91, "invoiceNumber": "CONS-2024-002", "supplierName": "Consultoría Fiscal Pro S.L.", "items": [{"description": "Asesoramiento fiscal trimestral", "totalPrice": 500.00}]}'::jsonb
    ),
    (
        'user_123', 
        'ocr_1704985200_ghi789', 
        'HOTEL-2024-003', 
        '2024-01-25',
        'Hotel Ejemplo Madrid',
        'B12345678',
        120.00,
        0.10,
        12.00,
        132.00,
        'expense',
        'travel_accommodation',
        100,
        'M303_C28',
        'IRPF_GASTOS_VIAJE',
        0.87,
        'extracted',
        'hotel_madrid_enero.png',
        512000,
        'image/png',
        'T1',
        2024,
        '{"id": "ocr_1704985200_ghi789", "extractedAt": "2024-01-25T09:45:00Z", "confidence": 0.87, "invoiceNumber": "HOTEL-2024-003", "supplierName": "Hotel Ejemplo Madrid", "items": [{"description": "Alojamiento 1 noche", "totalPrice": 120.00}]}'::jsonb
    );

SELECT 'OCR processed invoices table created and seeded successfully.' AS status;
