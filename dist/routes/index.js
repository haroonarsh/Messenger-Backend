"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./auth/auth.route"));
const chat_routes_1 = __importDefault(require("./chat/chat.routes"));
const user_routes_1 = __importDefault(require("./user/user.routes"));
const upload_routes_1 = __importDefault(require("./upload/upload.routes"));
const router = (0, express_1.Router)();
router.use("/user", auth_route_1.default);
router.use("/chat", chat_routes_1.default);
router.use("/user", user_routes_1.default);
router.use("/upload", upload_routes_1.default);
exports.default = router;
