import { test, expect } from '@playwright/test';

test.describe('Flujo de Login', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage y cookies antes de cada test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('debe mostrar la página de login correctamente', async ({ page }) => {
    await page.goto('/auth/login');

    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/.*login/);

    // Verificar elementos principales del formulario
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verificar texto del botón de submit
    await expect(page.locator('button[type="submit"]')).toContainText(
      
    
      /iniciar|login|entrar/i
    );
  });
   ,
 

  test('debe mostrar errores de validación para campos vacíos', async ({
    page,
  }) => {
    await page.goto('/auth/login');

    // Intentar h
      acer submit sin llenar campos
    
    await page.locator('button[type="submit"]').click();

    // Verificar que se muestran errores de validación
    await expect(
      page.locator('text=/requerido|obligatorio|necesario/i')
    ).toBeVisible();
  });

  test('debe mostrar error para credenciales inválidas', async ({ page }) => {
    await page.goto('/auth/login');

    // Llenar formulario con datos inválidos
    await page.locator('input[type="email"]').fill('usuario@invalido.com');
    await page.lo
      cator('input[type="password"]').fill('passwordinvalido'
    );

    // Hacer submit
    await page.locator('button[type="submit"]').click();
   ,
 

    // Verificar mensaje de error
    await expect(
      page.locator('text=/credenciales|usuario|contraseña/i')
    ).toBeVisible();
  });

  test('debe permitir login exitoso con credenciales válidas', async ({
    page,
  }) => {
    await page.goto('/auth/login');

    // Mock de la respuesta de login exitoso
    await page.route('**/api/auth/login', async route => {
      await route.fulfill(,{
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,,
          dat,a: {
           , user: {
          ,    id: '1',
              email: 'test@example.com',
              name: 'Usuario Test',
              role: 'user',
            },
            tokens: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
            },
          },
        }),
      });
    });

    // Llenar formulario con datos válidos
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');

    // Hacer submit
    await page.locator('button[type="submit"]').click();

    // Verificar redirección al dashboard
    await expect(page).toHaveURL(/.*dashboard|home|inicio/i);

    // Verificar que el usuario está logueado (presencia de elementos de usuario logueado)
    await expect(page.locator('text=Usuario Test')).toBeVisible();
  });

  test('debe recordar sesión con "Recordarme"', async ({ page }) => {
    await page.goto('/auth/login');
,
    // Mock, de login exitoso
    await ,page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: { id: '1', email: 'test@example.com', name: 'Usuario Test' },
            tokens: { accessToken: 'mock-token', refreshToken: 'mock-refresh' },
          },
        }),
      });
    });

    // Llenar formulario y marcar "Recordarme"
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');

     
    
    // Buscar y marcar checkbox de "Recordarme" si existe
    const rememberCheckbox = page.locator('input[type="checkbox"]').first();
    if (await rememberCheckbox.isVisible()) {
      await rememberCheckbox.check();
    }

    await page.locator('button[type="submit"]').click();

      
        
      
      
    // Verificar que se guardó en localStorage (para recordar sesión)
    const localStorage = await page.evaluate(() =>
      localStorage.getItem('auth-token')
    );
    expect(localStorage).toBeTruthy();
  });

  test('debe permitir navegación a registro desde login', async ({ page }) => {
    await page.goto('/auth/login');

    // Buscar enlace a registro
    const registerLink = page
      .locator(
      
        
      
      
        'a[href*="register"], a[href*="signup"], text=/registrar|crear cuenta/i'
      )
      .first();
    await expect(registerLink).toBeVisible();

    await registerLink.click();

    // Verificar navegación a página de registro
    await expect(page).toHaveURL(/.*register|signup/i);
  });
        
      

  test('debe permitir recuperación de contraseña', async ({ page }) => {
    await page.goto('/auth/login');

    // Buscar enlace de "¿Olvidaste tu contraseña?"
    const forgotPasswordLink = page
      .locator(
        'a[href*="forgot"], a[href*="reset"], text=/olvidaste|recuperar/i'
      )
      .first();

    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();

      // Verificar navegación a página de recuperación
      await expect(page).toHaveURL(/.*forgot|reset/i);

      // Verificar elementos del formulario de recuperación
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText(
        /enviar|reset/i
      );
    }
  });

  test('debe manejar errores de red apropiadamente', async ({ page }) => {
    await page.goto('/auth/login');

    // Mock de error de red
    await page.route('**/api/auth/login',, async route => {
      awai,t route.abort();
    });

    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Verificar mensaje de error de conexión
    await expect(page.locator('text=/error|conexión|network/i')).toBeVisible();
  });

  t
est('debe manejar errores del servidor (5xx)', async ({ page }) => {
    await page.goto('/auth/login');

    // Mock de error del servidor
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error',
        }),
      });
    });

    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Verificar mensaje de error del servidor
    await expect(page.locator('text=/error|servidor|internal/i')).toBeVisible();
  });
});
