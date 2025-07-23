export function errorHandler(err: Error, req: any, res: any, next: any) {
  console.error(err);
  res.status(500).send('Error interno del servidor');
}
