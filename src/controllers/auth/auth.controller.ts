import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import * as AuthService from "../../services/auth/auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        // express-validator check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const payload = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
        };

        // file from multer
        const file = (req as any).file as Express.Multer.File | undefined;

        const result = await AuthService.register(payload, file);
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const payload = {
            emailOrUsername: req.body.emailOrUsername,
            password: req.body.password,
        };
        const result = await AuthService.login(payload);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}