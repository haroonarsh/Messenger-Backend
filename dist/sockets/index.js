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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const pino_1 = __importDefault(require("pino"));
const ChatService = __importStar(require("../services/chat/chat.service"));
const logger = (0, pino_1.default)({ level: config_1.default.LOG_LEVEL });
function initSocket(server) {
    // allow CORS for your frontend origin, adjust as needed
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["Authorization", "Content-Type"],
        },
        pingTimeout: 60000, // 30 seconds
        pingInterval: 25000,
    });
    // Middleware to authenticate socket connections using JWT
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers["authorization"]?.split(' ')[1];
        if (!token) {
            logger.warn("Socket connection rejected: No token provided");
            return next(new Error("Authentication error: No token provided"));
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
            // Attach user to socket object (Type-safe)
            socket.data.user = { id: payload.sub || payload.id, ...payload };
            return next();
        }
        catch (error) {
            logger.warn("Socket connection rejected: Invalid token");
            return next(new Error("Authentication error: Invalid token"));
        }
    });
    io.on("connection", (socket) => {
        logger.info({ socketId: socket.id, user: socket.data.user }, "Socket connected");
        // sample: join user's own room for personal messages
        const userId = socket.data.user?.id;
        if (userId) {
            socket.join(`user:${userId}`);
            // Voice or video call signaling
            // 1. Offer call
            socket.on("call-offer", ({ toUserId, offer, payload }) => {
                socket.to(`user:${toUserId}`).emit("incoming-call", { fromUserId: userId, offer, callType: payload.callType });
            });
            // 2. Answer call
            socket.on("call-answer", ({ toUserId, answer }) => {
                socket.to(`user:${toUserId}`).emit("call-answered", { answer });
            });
            // 3. ICE candidates exchange
            socket.on("ice-candidate", ({ toUserId, candidate }) => {
                socket.to(`user:${toUserId}`).emit("ice-candidate", { candidate });
            });
            // 4. Hang up
            socket.on("call-hangup", ({ toUserId }) => {
                socket.to(`user:${toUserId}`).emit("call-ended");
            });
            // Typing start
            socket.on("typing", ({ conversationId }) => {
                socket.to(`conversation:${conversationId}`).emit("typing", { userId });
            });
            // Typing stop
            socket.on("stopTyping", ({ conversationId }) => {
                socket.to(`conversation:${conversationId}`).emit("stopTyping", { userId });
            });
            // Broadcast to all friends that user is online
            io.emit("userOnline", { userId });
            // On disconnect
            socket.on("disconnect", () => {
                io.emit("userOffline", { userId });
            });
        }
        // sample event: send-message
        socket.on("send-message", async (payload) => {
            const userId = socket.data.user?.id;
            console.log("Send message from user:", payload);
            if (!userId || !payload.conversationId)
                return;
            if (!userId || !payload.conversationId) {
                return socket.emit("error", { message: "Invalid data: missing user or conversation" });
            }
            if (!payload.text?.trim() && !payload.mediaUrl) {
                return socket.emit("error", { message: "Message must have text or media" });
            }
            try {
                const message = await ChatService.sendMessage(userId, payload.conversationId, payload.text || "", payload.type || "text", payload.mediaUrl);
                // Broadcast to all in conversation room
                io.to(`conversation:${payload.conversationId}`).emit("new-message", message);
                // Find receivers to notify (all participants except sender)
                const conversation = await ChatService.getConversationById(payload.conversationId);
                const receiverId = conversation?.participants.find(p => p.toString() !== userId)?.toString();
                if (receiverId) {
                    // Emit notification to receiver's personal room
                    io.to(`user:${receiverId}`).emit("new-message-notification", {
                        message,
                        senderId: userId,
                    });
                }
                // Optional: confirm to sender
                socket.emit("message-sent", { success: true, messageId: message._id });
            }
            catch (error) {
                socket.emit("error", { message: error.message });
            }
        });
        // Add listeners for motifications
        socket.on("friendRequest", (payload) => {
            // Already handled in controller
            io.to(`user:${payload.toUserId}`).emit("friendRequest", payload);
        });
        // In accept
        socket.on("friendRequestAccepted", (payload) => {
            io.to(`user:${payload.requestFromId}`).emit("friendRequestAccepted", payload);
        });
        // join conversation room
        socket.on("join-conversation", ({ conversationId }) => {
            if (!conversationId)
                return;
            socket.join(`conversation:${conversationId}`);
            logger.info({ socketId: socket.id, conversationId }, 'joined conversation room');
        });
        socket.on("leave-conversation", (reason) => {
            logger.info({ socketId: socket.id, reason }, 'leaved conversation');
        });
    });
    return io;
}
