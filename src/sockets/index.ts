import { Server as HttpServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config";
import pino from "pino";
import * as ChatService from "../services/chat/chat.service";

const logger = pino({ level: config.LOG_LEVEL });

export function initSocket(server: HttpServer) {
    // allow CORS for your frontend origin, adjust as needed
    const io = new IOServer(server, {
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
        if (userId) { 
            socket.join(`user:${userId}`);

            // Voice or video call signaling
            // 1. Offer call
            socket.on("call-offer", ({ toUserId, offer, payload }: { toUserId: string; offer: RTCSessionDescriptionInit, payload: { callType: "audio" | "video" } }) => {
                socket.to(`user:${toUserId}`).emit("incoming-call", { fromUserId: userId, offer, callType: payload.callType });
            });
            // 2. Answer call
            socket.on("call-answer", ({ toUserId, answer }: { toUserId: string; answer: RTCSessionDescriptionInit }) => {
                socket.to(`user:${toUserId}`).emit("call-answered", { answer });
            });
            // 3. ICE candidates exchange
            socket.on("ice-candidate", ({ toUserId, candidate }: { toUserId: string; candidate: RTCIceCandidateInit }) => {
                socket.to(`user:${toUserId}`).emit("ice-candidate", { candidate });
            });
            
            // 4. Hang up
            socket.on("call-hangup", ({ toUserId }: { toUserId: string }) => {
                socket.to(`user:${toUserId}`).emit("call-ended");
            });

            // Typing start
            socket.on("typing", ({ conversationId }: { conversationId: string }) => {
                socket.to(`conversation:${conversationId}`).emit("typing", { userId });
            });

            // Typing stop
            socket.on("stopTyping", ({ conversationId }: { conversationId: string }) => {
                socket.to(`conversation:${conversationId}`).emit("stopTyping", { userId });
            });

            // Broadcast to all friends that user is online
            io.emit("userOnline", { userId });

            // On disconnect
            socket.on("disconnect", () => {
                io.emit("userOffline", { userId });
            })
        }
        
        // sample event: send-message
        socket.on("send-message", async (payload: { conversationId: string; text?: string; type?: "text" | "image" | "video"; mediaUrl?: string }) => {
            const userId = socket.data.user?.id;
            console.log("Send message from user:", payload);
            if (!userId || !payload.conversationId) return;

            if (!userId || !payload.conversationId) {
                return socket.emit("error", { message: "Invalid data: missing user or conversation" });
            }

            if (!payload.text?.trim() && !payload.mediaUrl) {
                return socket.emit("error", { message: "Message must have text or media" });
            }

            try {
                const message = await ChatService.sendMessage(
                    userId,
                    payload.conversationId,
                    payload.text || "",
                    payload.type || "text",
                    payload.mediaUrl
                );

                // Broadcast to all in conversation room
                io.to(`conversation:${payload.conversationId}`).emit("new-message", message);

                // Optional: confirm to sender
                socket.emit("message-sent", { success: true, messageId: message._id });
            } catch (error) {
                socket.emit("error", { message: (error as Error).message });
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