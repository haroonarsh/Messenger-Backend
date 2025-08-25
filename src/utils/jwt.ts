import jwt from "jsonwebtoken";
import config from "../config";

export function signToken(payload: Record<string, any>) {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

export function verifyToken<T = any>(token: string): T {
    return jwt.verify(token, config.JWT_SECRET) as T;
}