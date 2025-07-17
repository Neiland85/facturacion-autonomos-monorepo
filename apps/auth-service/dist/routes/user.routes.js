"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.userRoutes = router;
router.get('/profile', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Profile endpoint - Auth middleware needed',
        data: {
            note: 'This endpoint requires JWT authentication middleware implementation'
        }
    });
});
//# sourceMappingURL=user.routes.js.map