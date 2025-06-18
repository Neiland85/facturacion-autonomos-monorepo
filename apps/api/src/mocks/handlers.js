import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Juan Pérez', email: 'juan.perez@example.com' },
        { id: '2', name: 'Ana López', email: 'ana.lopez@example.com' },
      ]),
    );
  }),
  rest.get('/api/invoices', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', clientName: 'Juan Pérez', total: 150.0 },
        { id: '2', clientName: 'Ana López', total: 200.0 },
      ]),
    );
  }),
  rest.post('/api/expenses/management', (req, res, ctx) => {
    const { expenseType, amount, date, description } = req.body;
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Gasto gestionado exitosamente',
        data: { expenseType, amount, date, description },
      }),
    );
  }),
];
