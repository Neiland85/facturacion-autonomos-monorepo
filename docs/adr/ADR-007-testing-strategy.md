# ADR-007: Estrategia de Testing y Calidad de Código

## Estado

**Propuesto** - Julio 2025

## Contexto

Necesitamos una estrategia robusta de testing que garantice:

- Calidad y confiabilidad del código
- Cobertura adecuada de funcionalidades críticas
- Testing automatizado en CI/CD
- Testing de integración con servicios externos
- Performance y accessibility testing

## Decisión

Implementamos una estrategia de testing **multi-layer** con **Jest** para unit/integration tests, **Cypress** para E2E testing, **Playwright** para cross-browser testing, y **Lighthouse CI** para performance/accessibility.

## Arquitectura de Testing

### Pirámide de Testing

\`\`\`
E2E Tests (Cypress/Playwright)
←────── Slow, Expensive ──────→
/ \\
Integration Tests (Jest + Supertest)
←──────── Medium Speed/Cost ────────→
/ \\
Unit Tests (Jest + Testing Library)
←────────── Fast, Cheap ──────────→
/ \\
Static Analysis (ESLint + TypeScript)
\`\`\`

### Configuración Jest (Unit/Integration)

\`\`\`typescript
// jest.config.js (root)
module.exports = {
projects: [
'<rootDir>/frontend/jest.config.js',
'<rootDir>/packages/*/jest.config.js',
'<rootDir>/apps/*/jest.config.js'
],
collectCoverageFrom: [
'src/**/*.{ts,tsx}',
'!src/**/*.d.ts',
'!src/**/*.stories.{ts,tsx}',
'!src/**/index.ts'
],
coverageThreshold: {
global: {
branches: 80,
functions: 80,
lines: 80,
statements: 80
}
},
watchPlugins: [
'jest-watch-typeahead/filename',
'jest-watch-typeahead/testname'
]
}

// packages/core/jest.config.js
module.exports = {
preset: 'ts-jest',
testEnvironment: 'node',
roots: ['<rootDir>/src', '<rootDir>/tests'],
testMatch: ['**/__tests__/**/*.(ts|js)', '**/*.(test|spec).(ts|js)'],
transform: {
'^.+\\\\.ts$': 'ts-jest'
},
collectCoverageFrom: [
'src/**/*.ts',
'!src/**/*.d.ts',
'!src/**/index.ts'
],
setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
moduleNameMapping: {
'@/(.\*)': '<rootDir>/src/$1'
}
}

// frontend/jest.config.js
module.exports = {
preset: 'next/jest',
testEnvironment: 'jsdom',
setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
moduleNameMapping: {
'^@/(.\*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
},
testPathIgnorePatterns: [
'<rootDir>/.next/',
'<rootDir>/node_modules/',
'<rootDir>/cypress/',
'<rootDir>/playwright/'
]
}
\`\`\`

### Testing Utilities

\`\`\`typescript
// frontend/src/test/setup.ts
import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Mock next/router
jest.mock('next/router', () => ({
useRouter() {
return {
route: '/',
pathname: '/',
query: {},
asPath: '/',
push: jest.fn(),
pop: jest.fn(),
reload: jest.fn(),
back: jest.fn(),
prefetch: jest.fn().mockResolvedValue(undefined),
beforePopState: jest.fn(),
events: {
on: jest.fn(),
off: jest.fn(),
emit: jest.fn()
}
}
}
}))

// Setup MSW
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// frontend/src/test/utils.tsx
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'

interface CustomRenderOptions extends RenderOptions {
initialUser?: User | null
theme?: 'light' | 'dark'
}

function render(
ui: ReactElement,
{
initialUser = null,
theme = 'light',
...renderOptions
}: CustomRenderOptions = {}
) {
const Wrapper = ({ children }: { children: React.ReactNode }) => (
<ThemeProvider defaultTheme={theme}>
<AuthProvider initialUser={initialUser}>
{children}
</AuthProvider>
</ThemeProvider>
)

return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

export \* from '@testing-library/react'
export { render }
\`\`\`

### Mock Service Worker (MSW)

\`\`\`typescript
// frontend/src/test/mocks/server.ts
import { setupServer } from 'msw/node'
import { authHandlers } from './handlers/auth'
import { invoiceHandlers } from './handlers/invoices'

export const server = setupServer(
...authHandlers,
...invoiceHandlers
)

// frontend/src/test/mocks/handlers/auth.ts
import { rest } from 'msw'

export const authHandlers = [
rest.post('/api/auth/login', (req, res, ctx) => {
const { email, password } = req.body as any

    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'USER'
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        })
      )
    }

    return res(
      ctx.status(401),
      ctx.json({ error: 'Credenciales inválidas' })
    )

}),

rest.get('/api/auth/me', (req, res, ctx) => {
const authorization = req.headers.get('authorization')

    if (authorization === 'Bearer mock-access-token') {
      return res(
        ctx.status(200),
        ctx.json({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER'
        })
      )
    }

    return res(ctx.status(401))

})
]
\`\`\`

### Testing de Componentes

\`\`\`typescript
// frontend/src/components/ui/button.test.tsx
import { render, screen, fireEvent } from '@/test/utils'
import { Button } from './button'

describe('Button', () => {
it('renders correctly', () => {
render(<Button>Click me</Button>)
expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
})

it('handles click events', () => {
const handleClick = jest.fn()
render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)

})

it('applies variant styles correctly', () => {
render(<Button variant="outline">Outline Button</Button>)
const button = screen.getByRole('button')
expect(button).toHaveClass('border-input')
})

it('is disabled when disabled prop is true', () => {
render(<Button disabled>Disabled Button</Button>)
expect(screen.getByRole('button')).toBeDisabled()
})
})

// Testing de hooks
// frontend/src/hooks/use-auth.test.tsx
import { renderHook, act } from '@testing-library/react'
import { useAuth, AuthProvider } from './use-auth'

const wrapper = ({ children }: { children: React.ReactNode }) => (
<AuthProvider>{children}</AuthProvider>
)

describe('useAuth', () => {
it('starts with no user', () => {
const { result } = renderHook(() => useAuth(), { wrapper })
expect(result.current.user).toBeNull()
expect(result.current.loading).toBe(false)
})

it('logs in successfully', async () => {
const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    expect(result.current.user).toEqual({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER'
    })

})

it('logs out successfully', () => {
const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()

})
})
\`\`\`

### Testing de APIs

\`\`\`typescript
// apps/api-facturas/src/routes/invoices.test.ts
import request from 'supertest'
import { app } from '../app'
import { prisma } from '@facturacion/core/db'
import { createAuthToken } from '../test/utils'

describe('POST /api/invoices', () => {
let authToken: string
let userId: string

beforeEach(async () => {
// Setup test user
const user = await prisma.user.create({
data: {
email: 'test@example.com',
name: 'Test User',
password: 'hashedPassword'
}
})
userId = user.id
authToken = createAuthToken(user)
})

afterEach(async () => {
// Cleanup
await prisma.invoice.deleteMany()
await prisma.user.deleteMany()
})

it('creates a new invoice', async () => {
const invoiceData = {
clientId: 'client-id',
items: [
{
description: 'Servicio de consultoría',
quantity: 1,
unitPrice: 100.00
}
]
}

    const response = await request(app)
      .post('/api/invoices')
      .set('Authorization', \`Bearer \${authToken}\`)
      .send(invoiceData)
      .expect(201)

    expect(response.body).toMatchObject({
      id: expect.any(String),
      subtotal: 100.00,
      taxAmount: 21.00,
      total: 121.00,
      status: 'DRAFT'
    })

    // Verify in database
    const invoice = await prisma.invoice.findUnique({
      where: { id: response.body.id }
    })
    expect(invoice).toBeTruthy()

})

it('requires authentication', async () => {
await request(app)
.post('/api/invoices')
.send({})
.expect(401)
})

it('validates required fields', async () => {
const response = await request(app)
.post('/api/invoices')
.set('Authorization', \`Bearer \${authToken}\`)
.send({})
.expect(400)

    expect(response.body.errors).toContain('clientId is required')

})
})
\`\`\`

### Configuración Cypress (E2E)

\`\`\`typescript
// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
e2e: {
baseUrl: 'http://localhost:3000',
viewportWidth: 1280,
viewportHeight: 720,
video: false,
screenshotOnRunFailure: true,
defaultCommandTimeout: 10000,
requestTimeout: 10000,
responseTimeout: 10000,
setupNodeEvents(on, config) {
// Cypress plugins
on('task', {
log(message) {
console.log(message)
return null
}
})
}
},
component: {
devServer: {
framework: 'next',
bundler: 'webpack'
}
}
})

// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
beforeEach(() => {
cy.visit('/login')
})

it('allows user to login', () => {
cy.get('[data-testid=email-input]').type('test@example.com')
cy.get('[data-testid=password-input]').type('password')
cy.get('[data-testid=login-button]').click()

    cy.url().should('include', '/dashboard')
    cy.get('[data-testid=user-menu]').should('contain', 'Test User')

})

it('shows error for invalid credentials', () => {
cy.get('[data-testid=email-input]').type('invalid@example.com')
cy.get('[data-testid=password-input]').type('wrongpassword')
cy.get('[data-testid=login-button]').click()

    cy.get('[data-testid=error-message]').should('contain', 'Credenciales inválidas')

})

it('redirects to login when not authenticated', () => {
cy.visit('/dashboard')
cy.url().should('include', '/login')
})
})

// cypress/e2e/invoices.cy.ts
describe('Invoice Management', () => {
beforeEach(() => {
cy.login('test@example.com', 'password')
cy.visit('/dashboard')
})

it('creates a new invoice', () => {
cy.get('[data-testid=new-invoice-button]').click()

    // Fill invoice form
    cy.get('[data-testid=client-select]').select('Test Client')
    cy.get('[data-testid=add-item-button]').click()
    cy.get('[data-testid=item-description]').type('Consultoría')
    cy.get('[data-testid=item-quantity]').type('1')
    cy.get('[data-testid=item-price]').type('100')

    cy.get('[data-testid=save-invoice-button]').click()

    // Verify invoice was created
    cy.get('[data-testid=invoice-list]').should('contain', 'Consultoría')
    cy.get('[data-testid=invoice-total]').should('contain', '121.00')

})
})
\`\`\`

### Configuración Playwright (Cross-browser)

\`\`\`typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
testDir: './playwright',
fullyParallel: true,
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
reporter: 'html',
use: {
baseURL: 'http://localhost:3000',
trace: 'on-first-retry'
},
projects: [
{
name: 'chromium',
use: { ...devices['Desktop Chrome'] }
},
{
name: 'firefox',
use: { ...devices['Desktop Firefox'] }
},
{
name: 'webkit',
use: { ...devices['Desktop Safari'] }
}
],
webServer: {
command: 'yarn dev',
url: 'http://localhost:3000',
reuseExistingServer: !process.env.CI
}
})

// playwright/invoice-flow.spec.ts
import { test, expect } from '@playwright/test'

test('complete invoice workflow', async ({ page }) => {
// Login
await page.goto('/login')
await page.fill('[data-testid=email-input]', 'test@example.com')
await page.fill('[data-testid=password-input]', 'password')
await page.click('[data-testid=login-button]')

// Navigate to invoices
await page.click('[data-testid=invoices-nav]')
await expect(page).toHaveURL('/invoices')

// Create new invoice
await page.click('[data-testid=new-invoice-button]')
await page.selectOption('[data-testid=client-select]', 'Test Client')

// Add invoice item
await page.click('[data-testid=add-item-button]')
await page.fill('[data-testid=item-description]', 'Web Development')
await page.fill('[data-testid=item-quantity]', '10')
await page.fill('[data-testid=item-price]', '50.00')

// Save invoice
await page.click('[data-testid=save-invoice-button]')

// Verify invoice in list
await expect(page.locator('[data-testid=invoice-list]')).toContainText('Web Development')
await expect(page.locator('[data-testid=invoice-total]')).toContainText('605.00')
})
\`\`\`

## Scripts de Testing

### Package.json Scripts

\`\`\`json
{
"scripts": {
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"test:e2e": "cypress run",
"test:e2e:open": "cypress open",
"test:cross-browser": "playwright test",
"test:all": "yarn test && yarn test:e2e && yarn test:cross-browser",
"test:ci": "yarn test:coverage && yarn test:e2e --record && yarn test:cross-browser"
}
}
\`\`\`

## Implementación por Fases

### Fase 1: Setup y Unit Tests (Semana 1)

- [ ] Configurar Jest en todos los packages
- [ ] Implementar testing utilities
- [ ] Tests de componentes UI críticos
- [ ] Tests de lógica de negocio (calculadora fiscal)

### Fase 2: Integration y E2E Tests (Semana 2)

- [ ] Tests de integración API
- [ ] Configurar Cypress para E2E
- [ ] Tests de flujos críticos (auth, facturas)
- [ ] Mock de servicios externos

### Fase 3: Advanced Testing (Semana 3)

- [ ] Configurar Playwright para cross-browser
- [ ] Performance testing con Lighthouse CI
- [ ] Accessibility testing
- [ ] Visual regression testing

### Fase 4: CI/CD Integration (Semana 4)

- [ ] Integrar tests en GitLab CI
- [ ] Coverage reporting
- [ ] Test parallelization
- [ ] Quality gates

## Consecuencias

### Positivas ✅

- **Confiabilidad**: Detección temprana de bugs
- **Refactoring**: Cambios seguros con tests
- **Documentación**: Tests como documentación viva
- **Performance**: Monitoring continuo de performance

### Negativas ❌

- **Setup Time**: Configuración inicial compleja
- **Maintenance**: Tests requieren mantenimiento
- **CI Time**: Tests aumentan tiempo de build
- **Learning Curve**: Team necesita formación

## Configuraciones VS Code

\`\`\`json
{
"jest.jestCommandLine": "yarn test",
"jest.autoRun": "watch",
"jest.showCoverageOnLoad": true,
"testing.automaticallyOpenPeekView": "never"
}
\`\`\`
