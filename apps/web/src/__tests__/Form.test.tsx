import { render, fireEvent, screen } from '@testing-library/react';
import Form from '../components/Form';

test('Envía datos correctamente al backend', async () => {
  render(<Form />);
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan' } });
  fireEvent.click(screen.getByText('Enviar'));
  expect(await screen.findByText('Formulario enviado')).toBeInTheDocument();
});
