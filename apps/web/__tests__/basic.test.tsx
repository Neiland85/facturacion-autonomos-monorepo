/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from '@jest/globals'; // Importación añadida

// Componente de prueba simple
const TestComponent = () => {
  return (
    <div data-testid="test-container">
      <h1 data-testid="test-title">Hello Test</h1>
      <button data-testid="test-button">Click me</button>
    </div>
  )
}

describe('Basic Tests', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true)
    expect(2 + 2).toBe(4);
  })

  it('should render test component', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('test-container')).toBeInTheDocument();
    expect(screen.getByTestId('test-title')).toHaveTextContent('Hello Test');
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();

    // Test button is clickable
    await user.click(button);
    expect(button).toBeInTheDocument(); // Still there after click
  });
})
