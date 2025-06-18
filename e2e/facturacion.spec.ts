import { test, expect } from '@playwright/test';

test.describe('Flujo de facturación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // TODO: Setup de autenticación
  });

  test('crear y enviar factura', async ({ page }) => {
    await page.click('[data-testid="nueva-factura"]');
    
    // Rellenar datos de factura
    await page.fill('[data-testid="numero"]', 'F2025-001');
    await page.fill('[data-testid="concepto"]', 'Servicios profesionales');
    await page.fill('[data-testid="importe"]', '1000');
    
    // Validar cálculos
    const iva = await page.locator('[data-testid="iva"]').innerText();
    expect(Number(iva)).toBe(210);
    
    // Enviar factura
    await page.click('[data-testid="enviar"]');
    await expect(page.locator('.toast-success')).toBeVisible();
  });
});
