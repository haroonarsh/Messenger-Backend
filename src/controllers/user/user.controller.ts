import e, { Request, Response } from "express";
import * as UserService from "../../services/user/user.service";
import * as UserRepo from "../../repositories/user.repo";

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Query is required' });
        const users = await UserService.searchUser(q as string, req.user?.id || '');
        return res.status(200).json(users);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await UserService.sendFriendRequest(req.user?.id || '', userId);
        // Emit notification via socket (assume io is passed or globally available)
        (req as any).io?.to(`user:${userId}`).emit("friendRequest", { from: req.user, message: 'You have a new friend request' });
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const getPendingRequests = async (req: Request, res: Response) => {
    try {
        const requests = await UserService.getPendingRequests(req.user?.id || '');
        return res.status(200).json(requests || []);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user?.id || '';

    const result = await UserService.acceptFriendRequest(currentUserId, requestId);

    // Find who sent the request to notify them
    const user = await UserRepo.findById(currentUserId);
    const request = user?.friendRequests?.find(req => req._id.toString() === requestId);
    const senderId = request?.from.toString();

    // Notify the sender that their request was accepted
    if (senderId) {
      (req as any).io?.to(`user:${senderId}`).emit("friendRequestAccepted", {
        from: { _id: currentUserId, name: req.user?.name, avatar: req.user?.avatar },
        conversationId: result.conversationId,
        message: "Your friend request was accepted!"
      });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Accept friend request error:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
    try {
        const { requestId } = req.params;
        const result = await UserService.rejectFriendRequest(req.user?.id || '', requestId);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export const addFriend = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await UserService.addFriend(req.user?.id || '', userId);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};