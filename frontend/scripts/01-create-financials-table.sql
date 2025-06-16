-- Drop table if it exists (optional, for a clean start)
DROP TABLE IF EXISTS quarterly_financial_records;

-- Create the table to store quarterly financial records
CREATE TABLE quarterly_financial_records (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL, -- In a real app, this might be a UUID referencing a users table
    quarter_label TEXT NOT NULL, -- e.g., "T1 2024"
    year INTEGER NOT NULL,
    quarter_num INTEGER NOT NULL CHECK (quarter_num BETWEEN 1 AND 4),
    income NUMERIC(12, 2) NOT NULL,
    expenses NUMERIC(12, 2) NOT NULL,
    vat_paid NUMERIC(12, 2) NOT NULL,
    irpf_paid NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_quarter UNIQUE (user_id, year, quarter_num) -- Ensure unique entry per user per quarter
);

-- Add an index for faster querying by user_id and time period
CREATE INDEX idx_user_period ON quarterly_financial_records (user_id, year DESC, quarter_num DESC);

-- Insert some sample data for a couple of users
INSERT INTO quarterly_financial_records
    (user_id, quarter_label, year, quarter_num, income, expenses, vat_paid, irpf_paid)
VALUES
    ('user_123', 'T1 2023', 2023, 1, 12000.00, 4500.00, 1575.00, 1500.00),
    ('user_123', 'T2 2023', 2023, 2, 13500.00, 5000.00, 1785.00, 1700.00),
    ('user_123', 'T3 2023', 2023, 3, 14000.00, 4800.00, 1932.00, 1840.00),
    ('user_123', 'T4 2023', 2023, 4, 15500.00, 6000.00, 1995.00, 1900.00),
    ('user_123', 'T1 2024', 2024, 1, 16000.00, 6200.00, 2058.00, 1960.00),
    ('user_123', 'T2 2024', 2024, 2, 17500.00, 6800.00, 2247.00, 2140.00),

    ('user_456', 'T3 2023', 2023, 3, 8000.00, 3000.00, 1050.00, 1000.00),
    ('user_456', 'T4 2023', 2023, 4, 9500.00, 3500.00, 1260.00, 1200.00),
    ('user_456', 'T1 2024', 2024, 1, 10000.00, 4000.00, 1260.00, 1200.00);

SELECT 'Quarterly financial records table created and seeded successfully.' AS status;
