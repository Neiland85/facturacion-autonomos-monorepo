<<<<<<< HEAD
import { render, screen } from '@testing-library/react';
<<<<<<< HEAD
=======
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
>>>>>>> origin/develop
import userEvent from '@testing-library/user-event';

// Componente de prueba simple
const TestComponent = () => {
  return (
    <div data-testid="test-container">
      <h1 data-testid="test-title">Hello Test</h1>
      <button data-testid="test-button">Click me</button>
    </div>
  );
};

describe('Basic Tests', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
    expect(2 + 2).toBe(4);
  });

  it('should render test component', () => {
    render(<TestComponent />);

    const container = screen.getByTestId('test-container');
    const title = screen.getByTestId('test-title');
    const button = screen.getByTestId('test-button');

    expect(container).toBeInTheDocument();
    expect(title).toHaveTextContent('Hello Test');
    expect(button).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(button).toBeInTheDocument();
  });
});
<<<<<<< HEAD
=======
import '@testing-library/jest-dom';
import React from 'react';
import App from '../src/App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
>>>>>>> develop
=======
>>>>>>> origin/develop
