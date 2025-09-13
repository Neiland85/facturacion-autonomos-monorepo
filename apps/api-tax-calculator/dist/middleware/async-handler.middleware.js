/**
 * Wrapper para manejo de errores async/await en rutas de Express
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
