"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
exports.authRoutes = router;
router.post('/register', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    (0, express_validator_1.body)('confirmPassword')
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('companyName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name must not exceed 100 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    validation_1.validateRequest
], (0, errorHandler_1.catchAsync)(auth_controller_1.authController.register));
router.post('/login', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    validation_1.validateRequest
], (0, errorHandler_1.catchAsync)(auth_controller_1.authController.login));
router.post('/refresh', [
    (0, express_validator_1.body)('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required'),
    validation_1.validateRequest
], (0, errorHandler_1.catchAsync)(auth_controller_1.authController.refreshToken));
router.post('/logout', (0, errorHandler_1.catchAsync)(auth_controller_1.authController.logout));
router.post('/forgot-password', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    validation_1.validateRequest
], (0, errorHandler_1.catchAsync)(auth_controller_1.authController.forgotPassword));
router.post('/reset-password', [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    (0, express_validator_1.body)('confirmPassword')
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    validation_1.validateRequest
], (0, errorHandler_1.catchAsync)(auth_controller_1.authController.resetPassword));
router.post('/verify-email', [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Verification token is required'),
    validation_1.validateRequest
], (0, errorHandler_1.catchAsync)(auth_controller_1.authController.verifyEmail));
//# sourceMappingURL=auth.routes.js.map