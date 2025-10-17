import { test as base, expect } from '@playwright/test';

// Extender la configuración base de Playwright con mocks
export const test = base.extend<{
  mockStripe: void;
  mockAEAT: void;
  mockExternalServices: void;
}>({
  // Mock completo de Stripe
  mockStripe: async ({ page }, use) => {
    // Mock de Stripe.js
    await page.addScriptTag({
      content: `
        window.Stripe = function(publicKey) {
          return {
            elements: function() {
              return {
                create: function(type, options) {
                  return {
                    mount: function(selector) {
                      const element = document.querySelector(selector);
                      if (element) {
                        element.innerHTML = '<div data-testid="stripe-element">•••• •••• •••• 4242</div>';
                      }
                    },
                    on: function(event, handler) {
                      // Mock event handlers
                    },
                    update: function(options) {
                      // Mock update
                    },
                    destroy: function() {
                      // Mock destroy
                    }
                  };
                }
              };
            },
            createToken: function(element, options) {
              return Promise.resolve({
                token: {
                  id: 'tok_test_4242424242424242',
                  object: 'token',
                  card: {
                    id: 'card_test',
                    object: 'card',
                    brand: 'Visa',
                    last4: '4242',
                    exp_month: 12,
                    exp_year: 2025
                  }
                }
              });
            },
            createPaymentMethod: function(options) {
              return Promise.resolve({
                paymentMethod: {
                  id: 'pm_test_visa',
                  object: 'payment_method',
                  card: {
                    brand: 'visa',
                    last4: '4242'
                  }
                }
              });
            },
            confirmCardPayment: function(clientSecret, options) {
              return Promise.resolve({
                paymentIntent: {
                  id: 'pi_test',
                  status: 'succeeded',
                  client_secret: clientSecret
                }
              });
            },
            confirmCardSetup: function(clientSecret, options) {
              return Promise.resolve({
                setupIntent: {
                  id: 'seti_test',
                  status: 'succeeded',
                  client_secret: clientSecret
                }
              });
            }
          };
        };
      `,
    });

    // Mock de endpoints de Stripe en el backend
    await page.route('**/api/stripe/create-payment-intent', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            clientSecret: 'pi_test_secret_1234567890',
            paymentIntentId: 'pi_test_1234567890',
          },
        }),
      });
    });

    await page.route('**/api/stripe/confirm-payment', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            paymentIntent: {
              id: 'pi_test_1234567890',
              status: 'succeeded',
              amount: 1999,
              currency: 'eur',
            },
          },
        }),
      });
    });

    await page.route('**/api/stripe/webhooks', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Webhook processed',
        }),
      });
    });

    await use();
  },

  // Mock completo de AEAT
  mockAEAT: async ({ page }, use) => {
    // Mock de validación de NIF/CIF
    await page.route('**/api/aeat/validate-nif**', async route => {
      const url = route.request().url();
      const nif = new URL(url).searchParams.get('nif') || '';

      // Simular validación de NIF español
      const isValidNIF = /^[0-9]{8}[A-Z]$/.test(nif) && validarLetraNIF(nif);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            nif: nif,
            isValid: isValidNIF,
            name: isValidNIF ? 'Empresa Ejemplo S.L.' : null,
            address: isValidNIF ? 'Calle Ejemplo 123, Madrid' : null,
          },
        }),
      });
    });

    // Mock de envío de facturas a AEAT
    await page.route('**/api/aeat/submit-invoice', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            submissionId: 'aeat_sub_' + Date.now(),
            status: 'accepted',
            timestamp: new Date().toISOString(),
            verificationCode:
              'AEAT' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          },
        }),
      });
    });

    // Mock de consulta de estado de envío
    await page.route('**/api/aeat/submission-status**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            submissionId: 'aeat_sub_1234567890',
            status: 'processed',
            processedAt: new Date().toISOString(),
            verificationCode: 'AEATVER123456789',
          },
        }),
      });
    });

    // Mock de cálculo de retenciones
    await page.route('**/api/aeat/retention-calculation', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            baseAmount: 1000,
            retentionPercentage: 15,
            retentionAmount: 150,
            netAmount: 850,
          },
        }),
      });
    });

    await use();
  },

  // Mock de servicios externos combinados
  mockExternalServices: async ({ page }, use) => {
    // Mock de servicios de email (SendGrid, Mailgun, etc.)
    await page.route('**/api/email/send**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            messageId: 'email_' + Date.now(),
            status: 'sent',
            to: 'cliente@example.com',
          },
        }),
      });
    });

    // Mock de servicios de SMS
    await page.route('**/api/sms/send**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            messageId: 'sms_' + Date.now(),
            status: 'delivered',
            to: '+34612345678',
          },
        }),
      });
    });

    // Mock de servicios de almacenamiento (AWS S3, Cloudinary, etc.)
    await page.route('**/api/storage/upload**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            fileId: 'file_' + Date.now(),
            url: 'https://storage.example.com/files/invoice_123.pdf',
            size: 245760,
            mimeType: 'application/pdf',
          },
        }),
      });
    });

    // Mock de servicios de geolocalización
    await page.route('**/api/geolocation/reverse**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            address: 'Calle Gran Vía 123, Madrid, España',
            coordinates: {
              lat: 40.4168,
              lng: -3.7038,
            },
            components: {
              street: 'Calle Gran Vía 123',
              city: 'Madrid',
              country: 'España',
              postalCode: '28013',
            },
          },
        }),
      });
    });

    // Mock de servicios de conversión de divisas
    await page.route('**/api/currency/convert**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            from: 'EUR',
            to: 'USD',
            amount: 100,
            convertedAmount: 108.5,
            rate: 1.085,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    });

    await use();
  },
});

// Función auxiliar para validar letra de NIF español
function validarLetraNIF(nif: string): boolean {
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const numero = parseInt(nif.substring(0, 8));
  const letra = nif.charAt(8);
  return letras.charAt(numero % 23) === letra;
}

// Configuraciones de mock específicas para diferentes escenarios
export const mockConfigs = {
  // Configuración para pruebas de pago exitosas
  successfulPayment: {
    stripe: {
      createPaymentIntent: {
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            clientSecret: 'pi_test_secret_success',
            paymentIntentId: 'pi_test_success',
          },
        }),
      },
      confirmPayment: {
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            paymentIntent: {
              id: 'pi_test_success',
              status: 'succeeded',
              amount: 1999,
              currency: 'eur',
            },
          },
        }),
      },
    },
  },

  // Configuración para pruebas de pago fallidas
  failedPayment: {
    stripe: {
      createPaymentIntent: {
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            clientSecret: 'pi_test_secret_failed',
            paymentIntentId: 'pi_test_failed',
          },
        }),
      },
      confirmPayment: {
        status: 400,
        body: JSON.stringify({
          success: false,
          error: 'Your card was declined',
          code: 'card_declined',
        }),
      },
    },
  },

  // Configuración para pruebas de AEAT con errores
  aeatErrors: {
    validateNIF: {
      status: 400,
      body: JSON.stringify({
        success: false,
        error: 'NIF inválido o no encontrado en AEAT',
      }),
    },
    submitInvoice: {
      status: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor AEAT',
      }),
    },
  },

  // Configuración para pruebas de red lenta
  slowNetwork: {
    delay: 3000, // 3 segundos de delay
    stripe: {
      createPaymentIntent: {
        status: 200,
        delay: 3000,
        body: JSON.stringify({
          success: true,
          data: {
            clientSecret: 'pi_test_secret_slow',
            paymentIntentId: 'pi_test_slow',
          },
        }),
      },
    },
  },
};

// Utilidades para aplicar configuraciones de mock específicas
export async function applyMockConfig(page: any, config: any) {
  for (const [service, endpoints] of Object.entries(config)) {
    for (const [endpoint, response] of Object.entries(endpoints as any)) {
      const urlPattern = `**/api/${service}/${endpoint}`;

      await page.route(urlPattern, async (route: any) => {
        const responseConfig = response as any;

        if (responseConfig.delay) {
          await new Promise(resolve =>
            setTimeout(resolve, responseConfig.delay)
          );
        }

        await route.fulfill({
          status: responseConfig.status,
          contentType: 'application/json',
          body: responseConfig.body,
        });
      });
    }
  }
}
