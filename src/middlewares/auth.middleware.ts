import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const header = (req.headers.authorization || "") as string;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = header.split(" ")[1];
    try {
        const payload = jwt.verify(token, config.JWT_SECRET) as any;
        req.user = {
            id: payload.sub || payload.id,
            username: payload.username,
            email: payload.email,
        };
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}