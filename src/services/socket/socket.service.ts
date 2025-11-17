import { Socket } from "socket.io";
import  * as ChatService from "../chat/chat.service";

export const handleSocketConnection = (socket: Socket) => {
    const userId = socket.data?.user?.id;

    socket.join(userId);

    socket.on("sendMessage", async (data) => {
        try {
            const message = await ChatService.sendMessage(userId, data.conversationId, data.content, data.type, data.mediaUrl);
            socket.to(data.conversationId).emit("newMessage", message);
        } catch (error: any) {
            socket.emit("error", { message: error.message });
        }
    });

    socket.on("disconnect", () => {
        socket.leave(userId);
    });
}