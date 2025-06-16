import { render, screen } from '@testing-library/react';
import Button from '../components/Button';

test('Renderiza el botón con el texto correcto', () => {
  render(<Button label="Enviar" />);
  expect(screen.getByText('Enviar')).toBeInTheDocument();
});
