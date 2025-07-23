export function requestLogger(req: any, res: any, next: any) {
  console.log(`${req.method} ${req.url}`);
  next();
}
