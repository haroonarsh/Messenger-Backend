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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFriend = exports.getFriends = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.getPendingRequests = exports.sendFriendRequest = exports.searchUsers = void 0;
const UserService = __importStar(require("../../services/user/user.service"));
const UserRepo = __importStar(require("../../repositories/user.repo"));
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q)
            return res.status(400).json({ message: 'Query is required' });
        const users = await UserService.searchUser(q, req.user?.id || '');
        return res.status(200).json(users);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.searchUsers = searchUsers;
const sendFriendRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await UserService.sendFriendRequest(req.user?.id || '', userId);
        // Emit notification via socket (assume io is passed or globally available)
        req.io?.to(`user:${userId}`).emit("friendRequest", { from: req.user, message: 'You have a new friend request' });
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.sendFriendRequest = sendFriendRequest;
const getPendingRequests = async (req, res) => {
    try {
        const requests = await UserService.getPendingRequests(req.user?.id || '');
        return res.status(200).json(requests || []);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getPendingRequests = getPendingRequests;
const acceptFriendRequest = async (req, res) => {
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
            req.io?.to(`user:${senderId}`).emit("friendRequestAccepted", {
                from: { _id: currentUserId, name: req.user?.name, avatar: req.user?.avatar },
                conversationId: result.conversationId,
                message: "Your friend request was accepted!"
            });
        }
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Accept friend request error:", error);
        return res.status(400).json({ message: error.message });
    }
};
exports.acceptFriendRequest = acceptFriendRequest;
const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const result = await UserService.rejectFriendRequest(req.user?.id || '', requestId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.rejectFriendRequest = rejectFriendRequest;
const getFriends = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await UserService.getFriends(userId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get friends error:", error);
        return res.status(500).json({ message: error.message || "Failed to get friends" });
    }
};
exports.getFriends = getFriends;
const addFriend = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await UserService.addFriend(req.user?.id || '', userId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.addFriend = addFriend;
