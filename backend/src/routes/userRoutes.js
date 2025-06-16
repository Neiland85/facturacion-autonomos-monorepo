"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var userController_1 = require("../controllers/userController");
var router = (0, express_1.Router)();
router.get('/users', userController_1.getUsers);
router.post('/users', userController_1.createUser);
exports.default = router;
