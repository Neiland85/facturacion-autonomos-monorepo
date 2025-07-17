"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("./errorHandler");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));
        throw new errorHandler_1.ValidationError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`);
    }
    next();
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.js.map