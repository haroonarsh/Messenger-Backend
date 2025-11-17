import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import * as AuthService from "../../services/auth/auth.service";

const cookieOptions = () => ({
    httpOnly: false,
    secure: true,
    sameSite: 'lax' as const, // lax
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    path: '/'
});

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
            bio: req.body.bio
        };

        // file from multer
        const file = (req as any).file as Express.Multer.File | undefined;

        const result = await AuthService.register(payload, file);

        // store token in cookie
        res.cookie('token', result.token, cookieOptions());
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

        res.cookie('token', result.token, cookieOptions());
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        next(error);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        next(error);
    }
}