import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding subscription plans...');

    // Starter Plan
    const starterPlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'Starter' },
      update: {},
      create: {
        name: 'Starter',
        description: 'Perfecto para freelancers que empiezan',
        price: 9.99,
        currency: 'EUR',
        interval: 'MONTH',
        features: JSON.stringify([
          'Hasta 50 facturas al mes',
          'Hasta 20 clientes',
          'Soporte por email',
          'Escaneo OCR básico',
        ]),
        maxInvoices: 50,
        maxClients: 20,
        isPopular: false,
        stripePriceId: 'price_starter_mock',
        isActive: true,
      },
    });
    console.log('✓ Starter plan created:', starterPlan.id);

    // Professional Plan
    const professionalPlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'Professional' },
      update: {},
      create: {
        name: 'Professional',
        description: 'Para profesionales con más demanda',
        price: 19.99,
        currency: 'EUR',
        interval: 'MONTH',
        features: JSON.stringify([
          'Hasta 200 facturas al mes',
          'Hasta 100 clientes',
          'Soporte prioritario',
          'Escaneo OCR ilimitado',
          'Integración bancaria',
        ]),
        maxInvoices: 200,
        maxClients: 100,
        isPopular: true,
        stripePriceId: 'price_professional_mock',
        isActive: true,
      },
    });
    console.log('✓ Professional plan created:', professionalPlan.id);

    // Enterprise Plan
    const enterprisePlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'Enterprise' },
      update: {},
      create: {
        name: 'Enterprise',
        description: 'Soluciones a medida para grandes empresas',
        price: 49.99,
        currency: 'EUR',
        interval: 'MONTH',
        features: JSON.stringify([
          'Facturas ilimitadas',
          'Clientes ilimitados',
          'Soporte 24/7',
          'API de acceso',
          'Gestor de cuenta dedicado',
          'Informes personalizados',
        ]),
        maxInvoices: 999999,
        maxClients: 999999,
        isPopular: false,
        stripePriceId: 'price_enterprise_mock',
        isActive: true,
      },
    });
    console.log('✓ Enterprise plan created:', enterprisePlan.id);

    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
