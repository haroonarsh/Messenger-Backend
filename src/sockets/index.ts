import { Server as HttpServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config";
import pino from "pino";

const logger = pino({ level: config.LOG_LEVEL });

export function initSocket(server: HttpServer) {
    // allow CORS for your frontend origin, adjust as needed
    const io = new IOServer(server, {
        cors: {
            origin: true,
            methods: ["GET", "POST"],
            credentials: true,
        },
        pingTimeout: 30000, // 30 seconds
    });

    // Middleware to authenticate socket connections using JWT
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth?.token || (socket.handshake.headers["authorization"] as string)?.split(' ')[1];
        if (!token) {
            logger.warn("Socket connection rejected: No token provided");
            return next(new Error("Authentication error: No token provided"));
        }
        try {
            const payload = jwt.verify(token, config.JWT_SECRET) as any;
            // Attach user to socket object (Type-safe)
            socket.data.user = { id: payload.sub || payload.id, ...payload };
            return next();
        } catch (error) {
            logger.warn("Socket connection rejected: Invalid token");
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket: Socket) => {
        logger.info({ socketId: socket.id, user: socket.data.user }, "Socket connected");

        // sample: join user's own room for personal messages
        const userId = socket.data.user?.id;
        if (userId) socket.join(`user:${userId}`);

        // sample event: send-message
        socket.on("send-message", async (payload: any) => {
            // payload: { consersationId, text, attachments, ... }
            logger.info({ socketId: socket.id, payload }, "send-message received");

            // TODO: validate, persist message to DB, emit to other participants, etc.
            // For demo, just broadcast to the conversation room:
            if (payload?.conversationId) {
                io.to(`conversation:${payload.conversationId}`).emit("new-message", {
                    ...payload,
                    senderId: userId,
                    timestamp: new Date().toISOString(),
                });
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
        socket.on("join-conversation", ({ conversationId }: { conversationId: string }) => {
            if (!conversationId) return;
            socket.join(`conversation:${conversationId}`);
            logger.info({ socketId: socket.id, conversationId }, 'joined conversation room');
        });

        socket.on("leave-conversation", (reason) => {
            logger.info({ socketId: socket.id, reason }, 'leaved conversation');
        });
    });

    return io;
}