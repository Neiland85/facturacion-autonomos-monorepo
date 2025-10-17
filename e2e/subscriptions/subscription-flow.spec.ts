import { test, expect } from '@playwright/test';

test.describe('Flujo Completo de Suscripción', () => {
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

  test('debe mostrar página de suscripciones correctamente', async ({
    page,
  }) => {
    // Mock de planes de suscripción
    await page.route('**/api/subscriptions/plans', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'starter',
              name: 'Starter',
              description: 'Perfecto para freelancers que empiezan',
              price: 9.99,
              currency: 'EUR',
              interval: 'month',
              features: ['Hasta 50 facturas al mes', 'Hasta 20 clientes'],
              maxInvoices: 50,
              maxClients: 20,
            },
            {
              id: 'professional',
              name: 'Professional',
              description: 'Para profesionales con más demanda',
              price: 19.99,
              currency: 'EUR',
              interval: 'month',
              features: ['Hasta 200 facturas al mes', 'Hasta 100 clientes'],
              maxInvoices: 200,
              maxClients: 100,
              isPopular: true,
            },
          ],
        }),
      });
    });

    await page.goto('/suscripciones');

    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/.*suscripciones|subscription/i);

    // Verificar que se muestran los planes
    await expect(page.locator('text=Starter')).toBeVisible();
    await expect(page.locator('text=Professional')).toBeVisible();
    await expect(page.locator('text=€9.99')).toBeVisible();
    await expect(page.locator('text=€19.99')).toBeVisible();
  });

  test('debe mostrar plan popular destacado', async ({ page }) => {
    await page.route('**/api/subscriptions/plans', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'starter',
              name: 'Starter',
              price: 9.99,
              isPopular: false,
            },
            {
              id: 'professional',
              name: 'Professional',
              price: 19.99,
              isPopular: true,
            },
          ],
        }),
      });
    });

    await page.goto('/suscripciones');

    // Verificar que el plan popular tiene indicador visual
    const popularBadge = page.locator('text=/popular|recomendado|destacado/i');
    await expect(popularBadge).toBeVisible();

    // Verificar que está cerca del plan Professional
    await expect(popularBadge.locator('..').locator('..')).toContainText(
      'Professional'
    );
  });

  test('debe mostrar características de cada plan', async ({ page }) => {
    await page.route('**/api/subscriptions/plans', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'starter',
              name: 'Starter',
              features: [
                'Hasta 50 facturas al mes',
                'Hasta 20 clientes',
                'Soporte básico',
              ],
            },
          ],
        }),
      });
    });

    await page.goto('/suscripciones');

    // Verificar que se muestran las características
    await expect(page.locator('text=Hasta 50 facturas al mes')).toBeVisible();
    await expect(page.locator('text=Hasta 20 clientes')).toBeVisible();
    await expect(page.locator('text=Soporte básico')).toBeVisible();
  });

  test('debe permitir seleccionar un plan', async ({ page }) => {
    await page.route('**/api/subscriptions/plans', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'starter',
              name: 'Starter',
              price: 9.99,
            },
          ],
        }),
      });
    });

    await page.goto('/suscripciones');

    // Hacer clic en botón de selección del plan
    const selectButton = page
      .locator('button, a')
      .filter({ hasText: /seleccionar|elegir|choose/i })
      .first();
    await selectButton.click();

    // Verificar navegación al checkout o confirmación
    await expect(page).toHaveURL(/.*checkout|confirmar|pago/i);
  });

  test('debe mostrar modal de confirmación de suscripción', async ({
    page,
  }) => {
    await page.goto('/suscripciones');

    // Mock de selección de plan
    await page.route('**/api/subscriptions/plans', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'professional',
              name: 'Professional',
              price: 19.99,
              features: ['200 facturas', '100 clientes'],
            },
          ],
        }),
      });
    });

    // Hacer clic en seleccionar plan
    await page
      .locator('button')
      .filter({ hasText: /seleccionar/i })
      .first()
      .click();

    // Verificar que se abre modal de confirmación
    const modal = page.locator('[role="dialog"], .modal, .overlay').first();
    await expect(modal).toBeVisible();

    // Verificar contenido del modal
    await expect(modal.locator('text=Professional')).toBeVisible();
    await expect(modal.locator('text=€19.99')).toBeVisible();
  });

  test('debe procesar pago con Stripe exitosamente', async ({ page }) => {
    await page.goto('/suscripciones/checkout?plan=professional');

    // Mock de Stripe Elements
    await page.addScriptTag({
      content: `
        window.Stripe = function() {
          return {
            elements: function() {
              return {
                create: function() {
                  return {
                    mount: function() {},
                    on: function() {},
                    update: function() {}
                  };
                }
              };
            },
            createToken: function() {
              return Promise.resolve({ token: { id: 'tok_test' } });
            },
            createPaymentMethod: function() {
              return Promise.resolve({ paymentMethod: { id: 'pm_test' } });
            }
          };
        };
      `,
    });

    // Mock de procesamiento de pago exitoso
    await page.route('**/api/subscriptions/create', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            subscriptionId: 'sub_test123',
            status: 'active',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            plan: {
              id: 'professional',
              name: 'Professional',
              price: 19.99,
            },
          },
        }),
      });
    });

    // Llenar datos de pago (simulado)
    await page
      .locator('input[name*="card"], input[placeholder*="card"]')
      .fill('4242424242424242');
    await page
      .locator('input[name*="expiry"], input[placeholder*="MM/YY"]')
      .fill('12/25');
    await page
      .locator('input[name*="cvc"], input[placeholder*="CVC"]')
      .fill('123');

    // Hacer clic en suscribirse
    await page
      .locator('button')
      .filter({ hasText: /suscribir|pagar|subscribe/i })
      .click();

    // Verificar éxito
    await expect(
      page.locator('text=/éxito|success|completada/i')
    ).toBeVisible();
    await expect(page.locator('text=sub_test123')).toBeVisible();
  });

  test('debe manejar errores de pago de Stripe', async ({ page }) => {
    await page.goto('/suscripciones/checkout?plan=starter');

    // Mock de error de pago
    await page.route('**/api/subscriptions/create', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Your card was declined',
          code: 'card_declined',
        }),
      });
    });

    // Llenar datos de tarjeta inválida
    await page.locator('input[name*="card"]').fill('4000000000000002'); // Tarjeta rechazada
    await page.locator('input[name*="expiry"]').fill('12/25');
    await page.locator('input[name*="cvc"]').fill('123');

    await page
      .locator('button')
      .filter({ hasText: /suscribir|pagar/i })
      .click();

    // Verificar mensaje de error
    await expect(
      page.locator('text=/declinada|rechazada|error/i')
    ).toBeVisible();
  });

  test('debe mostrar suscripción activa en dashboard', async ({ page }) => {
    // Mock de suscripción activa
    await page.route('**/api/subscriptions/current', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'sub_active123',
            status: 'active',
            plan: {
              id: 'professional',
              name: 'Professional',
              price: 19.99,
            },
            currentPeriodEnd: new Date(
              Date.now() + 25 * 24 * 60 * 60 * 1000
            ).toISOString(),
            cancelAtPeriodEnd: false,
          },
        }),
      });
    });

    await page.goto('/dashboard');

    // Verificar que se muestra la suscripción activa
    await expect(page.locator('text=Professional')).toBeVisible();
    await expect(page.locator('text=/activa|active/i')).toBeVisible();
    await expect(page.locator('text=€19.99')).toBeVisible();
  });

  test('debe permitir cancelar suscripción', async ({ page }) => {
    // Mock de cancelación exitosa
    await page.route('**/api/subscriptions/current/cancel', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'sub_active123',
            status: 'active',
            cancelAtPeriodEnd: true,
            currentPeriodEnd: new Date(
              Date.now() + 25 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        }),
      });
    });

    await page.goto('/suscripciones');

    // Hacer clic en cancelar suscripción
    const cancelButton = page
      .locator('button')
      .filter({ hasText: /cancelar|cancel/i });
    await cancelButton.click();

    // Confirmar cancelación
    const confirmButton = page
      .locator('button')
      .filter({ hasText: /confirmar|yes/i });
    await confirmButton.click();

    // Verificar mensaje de cancelación
    await expect(page.locator('text=/cancelada|cancelled/i')).toBeVisible();
  });

  test('debe mostrar límites de uso según plan', async ({ page }) => {
    // Mock de límites de uso
    await page.route('**/api/subscriptions/usage', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            invoices: { used: 45, limit: 50 },
            clients: { used: 18, limit: 20 },
            plan: 'starter',
          },
        }),
      });
    });

    await page.goto('/dashboard');

    // Verificar que se muestran los límites
    await expect(page.locator('text=45 / 50')).toBeVisible(); // Facturas
    await expect(page.locator('text=18 / 20')).toBeVisible(); // Clientes
  });

  test('debe mostrar warning cuando se acerca al límite', async ({ page }) => {
    await page.route('**/api/subscriptions/usage', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            invoices: { used: 48, limit: 50 }, // 96% usado
            clients: { used: 15, limit: 20 },
            plan: 'starter',
          },
        }),
      });
    });

    await page.goto('/dashboard');

    // Verificar warning de límite próximo
    await expect(page.locator('text=/próximo|límite|warning/i')).toBeVisible();
  });

  test('debe bloquear creación cuando se supera el límite', async ({
    page,
  }) => {
    await page.route('**/api/subscriptions/usage', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            invoices: { used: 50, limit: 50 }, // Límite alcanzado
            clients: { used: 20, limit: 20 },
            plan: 'starter',
          },
        }),
      });
    });

    await page.goto('/facturas/nueva');

    // Verificar que se bloquea la creación
    await expect(page.locator('text=/límite|limit|upgrade/i')).toBeVisible();

    // Verificar que el botón de crear está deshabilitado
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('debe manejar errores de red durante suscripción', async ({ page }) => {
    await page.goto('/suscripciones/checkout?plan=starter');

    // Mock de error de red
    await page.route('**/api/subscriptions/create', async route => {
      await route.abort();
    });

    await page.locator('input[name*="card"]').fill('4242424242424242');
    await page
      .locator('button')
      .filter({ hasText: /suscribir/i })
      .click();

    // Verificar mensaje de error de conexión
    await expect(page.locator('text=/error|conexión|network/i')).toBeVisible();
  });

  test('debe permitir cambiar de plan', async ({ page }) => {
    // Mock de cambio de plan exitoso
    await page.route('**/api/subscriptions/change-plan', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            subscriptionId: 'sub_test123',
            newPlan: {
              id: 'professional',
              name: 'Professional',
              price: 19.99,
            },
            prorationAmount: 5.5,
          },
        }),
      });
    });

    await page.goto('/suscripciones/cambiar-plan');

    // Seleccionar nuevo plan
    await page.locator('input[value="professional"]').check();

    // Confirmar cambio
    await page
      .locator('button')
      .filter({ hasText: /cambiar|change/i })
      .click();

    // Verificar cambio exitoso
    await expect(page.locator('text=/cambiado|changed/i')).toBeVisible();
  });
});
