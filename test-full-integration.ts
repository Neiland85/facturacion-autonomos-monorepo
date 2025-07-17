#!/usr/bin/env ts-node

import axios from 'axios';

const API_BASE = 'http://localhost:3002';

async function testInvoiceServiceIntegration() {
  console.log(
    '🧪 Iniciando pruebas de integración del servicio de facturas...\n'
  );

  try {
    // 1. Verificar que el servicio está funcionando
    console.log('1️⃣ Verificando health check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // 2. Obtener estadísticas
    console.log('\n2️⃣ Obteniendo estadísticas...');
    const statsResponse = await axios.get(`${API_BASE}/api/invoices/stats`);
    console.log('✅ Estadísticas:', statsResponse.data);

    // 3. Obtener lista de facturas
    console.log('\n3️⃣ Obteniendo lista de facturas...');
    const invoicesResponse = await axios.get(`${API_BASE}/api/invoices`);
    console.log('✅ Facturas:', {
      total: invoicesResponse.data.total,
      count: invoicesResponse.data.invoices?.length || 0,
    });

    // 4. Crear una factura de prueba
    console.log('\n4️⃣ Creando factura de prueba...');
    const testInvoice = {
      number: `TEST-${Date.now()}`,
      series: 'TEST',
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customer: {
        name: 'Cliente Prueba',
        email: 'cliente@test.com',
        taxId: '12345678A',
        address: 'Calle Test, 123',
      },
      items: [
        {
          description: 'Producto de prueba',
          quantity: 2,
          unitPrice: 100,
          total: 200,
          vatRate: 21,
        },
      ],
      subtotal: 200,
      vatAmount: 42,
      total: 242,
      status: 'draft' as const,
    };

    const createResponse = await axios.post(
      `${API_BASE}/api/invoices`,
      testInvoice
    );
    console.log('✅ Factura creada:', {
      id: createResponse.data.id,
      number: createResponse.data.number,
      total: createResponse.data.total,
    });

    // 5. Obtener la factura creada
    console.log('\n5️⃣ Verificando factura creada...');
    const getResponse = await axios.get(
      `${API_BASE}/api/invoices/${createResponse.data.id}`
    );
    console.log('✅ Factura obtenida:', {
      id: getResponse.data.id,
      number: getResponse.data.number,
      status: getResponse.data.status,
    });

    console.log('\n🎉 ¡Todas las pruebas de integración pasaron exitosamente!');
    console.log(
      '\n🌐 El frontend debería poder conectarse al API sin problemas.'
    );
    console.log('📊 Swagger disponible en: http://localhost:3002/api-docs');
  } catch (error: any) {
    console.error('\n❌ Error en las pruebas:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.code === 'ECONNREFUSED') {
      console.log(
        '\n💡 El servicio no está funcionando. Para iniciarlo ejecuta:'
      );
      console.log('   cd apps/invoice-service && pnpm dev');
    }
  }
}

// Solo ejecutar si no está el servicio funcionando
async function checkServiceAndRun() {
  try {
    await axios.get(`${API_BASE}/health`);
    await testInvoiceServiceIntegration();
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  El servicio de facturas no está funcionando.');
      console.log(
        '🚀 Inicia el servicio primero con: cd apps/invoice-service && pnpm dev'
      );
      console.log('⏱️  Luego ejecuta este script de nuevo.');
    } else {
      await testInvoiceServiceIntegration();
    }
  }
}

checkServiceAndRun();
