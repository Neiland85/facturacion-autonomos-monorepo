/**
 * Middleware para manejar errores en funciones async
 * Envuelve controladores async para capturar errores automáticamente
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
//# sourceMappingURL=async-handler.middleware.js.map