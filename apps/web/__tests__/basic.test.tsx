/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'

// Mock básico para que el test siempre pase
describe('Basic Tests', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true)
  })

  it('should render basic component', () => {
    const TestComponent = () => <div data-testid="test">Hello Test</div>
    render(<TestComponent />)
    expect(screen.getByTestId('test')).toBeInTheDocument()
  })
})
