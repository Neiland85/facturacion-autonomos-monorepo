import { test, expect } from '@playwright/test';

test.describe('Flujo Completo de Creación de Factura', () => {
  test.beforeEach(async ({ page }) => {
    // Login automático antes de cada test
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: 'mock-jwt-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Mock del endpoint de verificación de auth
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              name: 'Usuario Test',
              role: 'user',
            },
          },
        }),
      });
    });
  });

  test('debe mostrar la página de facturas correctamente', async ({ page }) => {
    // Mock de lista de facturas vacía
    await page.route('**/api/invoices**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 10 },
        }),
      });
    });

    await page.goto('/facturas');

    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/.*facturas/);

    // Verificar elementos principales
    await expect(page.locator('text=/facturas|invoices/i')).toBeVisible();
    await expect(
      page.locator('button, a').filter({ hasText: /nueva|crear|new/i })
    ).toBeVisible();
  });

  test('debe mostrar formulario de creación de factura', async ({ page }) => {
    await page.goto('/facturas');

    // Hacer clic en botón de nueva factura
    const newInvoiceButton = page
      .locator('button, a')
      .filter({ hasText: /nueva|crear|new/i })
      .first();
    await newInvoiceButton.click();

    // Verificar que se abre el formulario
    await expect(page.locator('form')).toBeVisible();

    // Verificar campos principales del formulario
    await expect(
      page.locator('input[name*="cliente"], input[placeholder*="cliente"]')
    ).toBeVisible();
    await expect(
      page.locator('input[name*="concepto"], textarea[name*="concepto"]')
    ).toBeVisible();
    await expect(
      page.locator('input[name*="importe"], input[name*="amount"]')
    ).toBeVisible();
    await expect(
      page.locator('input[name*="fecha"], input[type="date"]')
    ).toBeVisible();
  });

  test('debe crear factura básica exitosamente', async ({ page }) => {
    await page.goto('/facturas/nueva');

    // Mock de creación exitosa
    await page.route('**/api/invoices', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'inv-123',
              number: 'FAC-001',
              clientName: 'Cliente Test S.L.',
              concept: 'Servicio de consultoría',
              amount: 1000,
              taxRate: 21,
              total: 1210,
              status: 'draft',
              createdAt: new Date().toISOString(),
            },
          }),
        });
      }
    });

    // Llenar formulario básico
    await page.locator('input[name*="cliente"]').fill('Cliente Test S.L.');
    await page
      .locator('input[name*="concepto"], textarea[name*="concepto"]')
      .fill('Servicio de consultoría');
    await page.locator('input[name*="importe"]').fill('1000');
    await page
      .locator('select[name*="iva"], input[name*="iva"]')
      .selectOption('21');

    // Submit del formulario
    await page.locator('button[type="submit"]').click();

    // Verificar redirección o mensaje de éxito
    await expect(page.locator('text=/éxito|success|creada/i')).toBeVisible();

    // Verificar que aparece en la lista de facturas
    await expect(page.locator('text=Cliente Test S.L.')).toBeVisible();
    await expect(page.locator('text=FAC-001')).toBeVisible();
  });

  test('debe validar campos requeridos en el formulario', async ({ page }) => {
    await page.goto('/facturas/nueva');

    // Intentar submit sin llenar campos
    await page.locator('button[type="submit"]').click();

    // Verificar errores de validación
    await expect(
      page.locator('text=/requerido|obligatorio|necesario/i')
    ).toBeVisible();
  });

  test('debe calcular automáticamente el total con IVA', async ({ page }) => {
    await page.goto('/facturas/nueva');

    // Llenar importe base
    await page.locator('input[name*="importe"]').fill('1000');

    // Seleccionar IVA
    await page.locator('select[name*="iva"]').selectOption('21');

    // Verificar cálculo automático del total (1000 + 21% = 1210)
    await expect(page.locator('text=1210')).toBeVisible();
  });

  test('debe permitir agregar múltiples líneas de factura', async ({
    page,
  }) => {
    await page.goto('/facturas/nueva');

    // Buscar botón de agregar línea
    const addLineButton = page
      .locator('button')
      .filter({ hasText: /agregar|añadir|add/i });

    if (await addLineButton.isVisible()) {
      await addLineButton.click();

      // Verificar que se agregó una nueva línea
      const lineItems = page.locator(
        'input[name*="concepto"], textarea[name*="concepto"]'
      );
      await expect(lineItems).toHaveCount((await lineItems.count()) + 1);
    }
  });

  test('debe manejar errores de creación de factura', async ({ page }) => {
    await page.goto('/facturas/nueva');

    // Mock de error en creación
    await page.route('**/api/invoices', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Datos de factura inválidos',
            details: { clientName: 'Nombre de cliente requerido' },
          }),
        });
      }
    });

    // Llenar formulario con datos incompletos
    await page
      .locator('input[name*="concepto"]')
      .fill('Servicio de consultoría');
    await page.locator('input[name*="importe"]').fill('1000');

    await page.locator('button[type="submit"]').click();

    // Verificar mensaje de error
    await expect(page.locator('text=/error|inválidos/i')).toBeVisible();
  });

  test('debe permitir guardar como borrador', async ({ page }) => {
    await page.goto('/facturas/nueva');

    // Mock de guardado como borrador
    await page.route('**/api/invoices', async route => {
      if (route.request().method() === 'POST') {
        const requestData = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'inv-123',
              status: requestData.status === 'draft' ? 'draft' : 'pending',
              ...requestData,
            },
          }),
        });
      }
    });

    // Llenar datos básicos
    await page.locator('input[name*="cliente"]').fill('Cliente Test S.L.');
    await page.locator('input[name*="concepto"]').fill('Servicio pendiente');

    // Buscar botón de guardar como borrador
    const draftButton = page
      .locator('button')
      .filter({ hasText: /borrador|draft/i });

    if (await draftButton.isVisible()) {
      await draftButton.click();

      // Verificar que se guardó como borrador
      await expect(page.locator('text=/borrador|draft/i')).toBeVisible();
    }
  });

  test('debe permitir editar factura existente', async ({ page }) => {
    // Mock de factura existente
    await page.route('**/api/invoices/inv-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'inv-123',
            clientName: 'Cliente Original',
            concept: 'Servicio original',
            amount: 500,
            taxRate: 21,
            status: 'draft',
          },
        }),
      });
    });

    await page.goto('/facturas/inv-123/editar');

    // Verificar que los datos se cargaron
    await expect(page.locator('input[name*="cliente"]')).toHaveValue(
      'Cliente Original'
    );
    await expect(page.locator('input[name*="concepto"]')).toHaveValue(
      'Servicio original'
    );

    // Modificar datos
    await page.locator('input[name*="cliente"]').fill('Cliente Modificado');
    await page.locator('input[name*="importe"]').fill('750');

    // Mock de actualización
    await page.route('**/api/invoices/inv-123', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'inv-123',
              clientName: 'Cliente Modificado',
              amount: 750,
              status: 'draft',
            },
          }),
        });
      }
    });

    await page.locator('button[type="submit"]').click();

    // Verificar actualización exitosa
    await expect(page.locator('text=/actualizada|modificada/i')).toBeVisible();
  });

  test('debe permitir descargar factura en PDF', async ({ page }) => {
    await page.goto('/facturas/inv-123');

    // Mock de descarga PDF
    await page.route('**/api/invoices/inv-123/pdf', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: {
          'Content-Disposition': 'attachment; filename="factura-123.pdf"',
        },
        body: Buffer.from('%PDF-1.4 mock pdf content'),
      });
    });

    // Buscar botón de descarga PDF
    const downloadButton = page
      .locator('button, a')
      .filter({ hasText: /pdf|descargar|download/i });

    if (await downloadButton.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadButton.click(),
      ]);

      // Verificar que se inició la descarga
      expect(download.suggestedFilename()).toBe('factura-123.pdf');
    }
  });

  test('debe manejar errores de red durante creación', async ({ page }) => {
    await page.goto('/facturas/nueva');

    // Mock de error de red
    await page.route('**/api/invoices', async route => {
      await route.abort();
    });

    await page.locator('input[name*="cliente"]').fill('Cliente Test');
    await page.locator('input[name*="concepto"]').fill('Servicio test');
    await page.locator('input[name*="importe"]').fill('1000');

    await page.locator('button[type="submit"]').click();

    // Verificar mensaje de error de conexión
    await expect(page.locator('text=/error|conexión|network/i')).toBeVisible();
  });
});
