"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
function authMiddleware(req, res, next) {
    const header = (req.headers.authorization || "");
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = header.split(" ")[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        req.user = {
            id: payload.sub || payload.id,
            username: payload.username,
            email: payload.email,
            name: payload.name,
            bio: payload.bio,
            avatar: payload.avatar,
            status: payload.status,
            createdAt: payload.createdAt,
            updatedAt: payload.updatedAt,
        };
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}
