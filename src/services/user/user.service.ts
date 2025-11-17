import { Types } from "mongoose";
import { createConversation, findConversationByParticipants } from "../../repositories/conversation.repo";
import * as UserRepo from "../../repositories/user.repo";

export const searchUser = async (query: string, userId: string) => {
    return UserRepo.searchUsers(query, userId);
};

export const sendFriendRequest = async (fromUserId: string, toUserId: string) => {
    const toUser = await UserRepo.findById(toUserId);
    if (!toUser) throw new Error('User not found');

    const fromUser = await UserRepo.findById(fromUserId);
    if (toUser?.friends?.includes(new Types.ObjectId(toUserId))) throw new Error('Already friends');
    if (toUser?.friendRequests?.some(req => req.from.toString() === fromUserId && req.status === 'pending')) throw new Error('Friend request already sent');

    await UserRepo.sendFriendRequest(fromUserId, toUserId);

    return { message: 'Friend request sent', toUser };
};

export const getPendingRequests = async (userId: string) => {
    const userWithRequests = await UserRepo.getPendingRequests(userId);
    if (!userWithRequests) throw new Error('User not found');

    return userWithRequests.friendRequests;
}

export const acceptFriendRequest = async (userId: string, requestFromId: string) => {
    const result = await UserRepo.acceptFriendRequest(userId, requestFromId);

    // Create conversation upon accepting friend request
    let conversation = await findConversationByParticipants([userId, requestFromId]);
    if (!conversation) {
        conversation = await createConversation([userId, requestFromId]);
    }

    return { message: 'Friend request accepted', conversation };
}

///////////////////////

export const addFriend = async (currentUserId: string, friendId: string) => {
    const friend = await UserRepo.findById(friendId);
    if (!friend) throw new Error('User not found');

    const currentUser = await UserRepo.findById(currentUserId);
    if (currentUser?.friends?.includes(new Types.ObjectId(friendId))) throw new Error('Already friends');

    await addFriend(currentUserId, friendId);
    await addFriend(friendId, currentUserId);

    let conversation = await findConversationByParticipants([currentUserId, friendId]);
    if (!conversation) {
        conversation = await createConversation([currentUserId, friendId]);
    }

    return { message: 'Friend added', conversation };
};