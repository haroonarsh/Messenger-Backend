"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
exports.logout = logout;
const express_validator_1 = require("express-validator");
const AuthService = __importStar(require("../../services/auth/auth.service"));
const cookieOptions = () => ({
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    path: '/'
});
async function register(req, res, next) {
    try {
        // express-validator check
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const payload = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            bio: req.body.bio
        };
        // file from multer
        const file = req.file;
        const result = await AuthService.register(payload, file);
        // store token in cookie
        res.cookie('token', result.token, cookieOptions());
        return res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const payload = {
            emailOrUsername: req.body.emailOrUsername,
            password: req.body.password,
        };
        const result = await AuthService.login(payload);
        res.cookie('token', result.token, cookieOptions());
        return res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function getMe(req, res, next) {
    try {
        return res.status(200).json(req.user);
    }
    catch (error) {
        next(error);
    }
}
async function logout(req, res, next) {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: 'Logout successful' });
    }
    catch (error) {
        next(error);
    }
}
