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
exports.addFriend = exports.getFriends = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.getPendingRequests = exports.sendFriendRequest = exports.searchUser = void 0;
const mongoose_1 = require("mongoose");
const UserRepo = __importStar(require("../../repositories/user.repo"));
const ConversationRepo = __importStar(require("../../repositories/conversation.repo"));
const searchUser = async (query, userId) => {
    return UserRepo.searchUsers(query, userId);
};
exports.searchUser = searchUser;
const sendFriendRequest = async (fromUserId, toUserId) => {
    const toUser = await UserRepo.findById(toUserId);
    if (!toUser)
        throw new Error('User not found');
    const fromUser = await UserRepo.findById(fromUserId);
    if (fromUser?.friends?.includes(new mongoose_1.Types.ObjectId(toUserId)))
        throw new Error('Already friends');
    if (toUser?.friendRequests?.some(req => req.from.toString() === fromUserId && req.status === 'pending'))
        throw new Error('Friend request already sent');
    await UserRepo.sendFriendRequest(fromUserId, toUserId);
    return { message: 'Friend request sent', toUser };
};
exports.sendFriendRequest = sendFriendRequest;
const getPendingRequests = async (userId) => {
    const userWithRequests = await UserRepo.getPendingRequests(userId);
    if (!userWithRequests)
        throw new Error('User not found');
    return userWithRequests.friendRequests || [];
};
exports.getPendingRequests = getPendingRequests;
const acceptFriendRequest = async (userId, requestId) => {
    // First, get the request to know who sent it
    const user = await UserRepo.findById(userId);
    if (!user)
        throw new Error("User not found");
    const request = user.friendRequests?.find(r => r._id.toString() === requestId);
    if (!request || request.status !== 'pending') {
        throw new Error("Invalid or already processed request");
    }
    const fromUserId = request.from.toString();
    // Accept the request (removes from pending, adds to friends)
    await UserRepo.acceptFriendRequest(userId, fromUserId);
    // Create 1-on-1 conversation if not exists
    let conversation = await ConversationRepo.findConversationByParticipants([userId, fromUserId]);
    if (!conversation) {
        conversation = await ConversationRepo.createConversation([userId, fromUserId]);
    }
    return {
        message: 'Friend request accepted',
        conversationId: conversation._id.toString()
    };
};
exports.acceptFriendRequest = acceptFriendRequest;
const rejectFriendRequest = async (userId, requestFromId) => {
    const result = await UserRepo.rejectFriendRequest(userId, requestFromId);
    return { message: 'Friend request rejected' };
};
exports.rejectFriendRequest = rejectFriendRequest;
// export const getFriends = async (userId: string): Promise<UserType[]> => {
//   if (!userId) throw new Error("User ID is required");
//   const currentUser = await User.findById(userId)
//     .populate<{ friends: UserType[] }>('friends', 'name username avatar')
//     .lean() // Optional but recommended — gives plain objects (no Mongoose docs)
//     .exec();
//   if (!currentUser) throw new Error("User not found");
//   return currentUser.friends || [];
// };
const getFriends = async (userId) => {
    const user = await UserRepo.getUserWithPopulatedFriends(userId);
    if (!user)
        throw new Error("User not found");
    return user.friends || [];
};
exports.getFriends = getFriends;
///////////////////////
const addFriend = async (currentUserId, friendId) => {
    const friend = await UserRepo.findById(friendId);
    if (!friend)
        throw new Error('User not found');
    const currentUser = await UserRepo.findById(currentUserId);
    if (currentUser?.friends?.includes(new mongoose_1.Types.ObjectId(friendId)))
        throw new Error('Already friends');
    await (0, exports.addFriend)(currentUserId, friendId);
    await (0, exports.addFriend)(friendId, currentUserId);
    let conversation = await ConversationRepo.findConversationByParticipants([currentUserId, friendId]);
    if (!conversation) {
        conversation = await ConversationRepo.createConversation([currentUserId, friendId]);
    }
    return { message: 'Friend added', conversation };
};
exports.addFriend = addFriend;
