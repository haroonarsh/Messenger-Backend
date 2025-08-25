import { body } from "express-validator";

export const registerValidator = [
    body('username')
        .isString()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters'),
    body('email')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('name')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Name can be up to 50 characters long'),
];

export const loginValidator = [
    body('emailOrUsername')
        .notEmpty()
        .withMessage('Email or Username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];