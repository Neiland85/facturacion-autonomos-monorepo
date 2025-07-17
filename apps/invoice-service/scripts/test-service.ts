#!/usr/bin/env node

import { Invoice, InvoiceStatusType } from '../src/models/invoice.model';
import { invoiceService } from '../src/services/invoice.service';

async function testInvoiceService() {
  console.log('🧪 Testing Invoice Service...\n');

  try {
    // Test data
    const testInvoice: Invoice = {
      number: 'TEST-001',
      series: 'TEST',
      status: 'draft' as InvoiceStatusType,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      issuer: {
        name: 'Test Company S.L.',
        taxId: 'B12345678',
        address: 'Calle Test 123',
        city: 'Madrid',
        postalCode: '28001',
        country: 'España',
        email: 'test@company.com',
        phone: '+34 912 345 678',
      },
      client: {
        name: 'Client Company S.L.',
        taxId: 'B87654321',
        address: 'Avenida Cliente 456',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'España',
        email: 'client@company.com',
      },
      items: [
        {
          description: 'Consultoría de desarrollo',
          quantity: 10,
          unitPrice: 100,
          discount: 0,
          taxType: 'iva_21',
          taxRate: 21,
        },
        {
          description: 'Soporte técnico',
          quantity: 5,
          unitPrice: 80,
          discount: 10,
          taxType: 'iva_21',
          taxRate: 21,
        },
      ],
      notes: 'Factura de prueba para testing del sistema',
    };

    console.log('📝 Creating test invoice...');
    const createdInvoice = await invoiceService.create(testInvoice);
    console.log(`✅ Invoice created with ID: ${createdInvoice.id}`);
    console.log(`📊 Total: ${createdInvoice.total} EUR`);

    console.log('\n📋 Getting all invoices...');
    const allInvoices = await invoiceService.getAll({});
    console.log(`✅ Found ${allInvoices.invoices.length} invoices`);

    console.log('\n🔍 Getting invoice by ID...');
    const retrievedInvoice = await invoiceService.getById(createdInvoice.id!);
    console.log(`✅ Retrieved invoice: ${retrievedInvoice?.number}`);

    console.log('\n📈 Getting statistics...');
    const stats = await invoiceService.getStats();
    console.log('✅ Statistics:', {
      totalInvoices: stats.totalInvoices,
      totalAmount: stats.totalAmount,
      paidAmount: stats.paidAmount,
    });

    console.log('\n🔄 Updating invoice status...');
    const updatedInvoice = await invoiceService.update(createdInvoice.id!, {
      status: 'sent' as InvoiceStatusType,
    });
    console.log(`✅ Invoice status updated to: ${updatedInvoice?.status}`);

    console.log('\n📑 Duplicating invoice...');
    const duplicatedInvoice = await invoiceService.duplicate(createdInvoice);
    console.log(`✅ Invoice duplicated with ID: ${duplicatedInvoice.id}`);

    console.log('\n🗑️ Cleaning up test data...');
    await invoiceService.delete(createdInvoice.id!);
    await invoiceService.delete(duplicatedInvoice.id!);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testInvoiceService();
