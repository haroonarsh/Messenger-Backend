import { Types } from "mongoose";
import * as UserRepo from "../../repositories/user.repo";
import * as ConversationRepo from "../../repositories/conversation.repo";
import { UserType } from "../../interfaces/auth.interface";
import User from "../../models/user.model";

export const searchUser = async (query: string, userId: string) => {
    return UserRepo.searchUsers(query, userId);
};

export const sendFriendRequest = async (fromUserId: string, toUserId: string) => {
    const toUser = await UserRepo.findById(toUserId);
    if (!toUser) throw new Error('User not found');

    const fromUser = await UserRepo.findById(fromUserId);
    if (fromUser?.friends?.includes(new Types.ObjectId(toUserId))) throw new Error('Already friends');
    if (toUser?.friendRequests?.some(req => req.from.toString() === fromUserId && req.status === 'pending')) throw new Error('Friend request already sent');

    await UserRepo.sendFriendRequest(fromUserId, toUserId);

    return { message: 'Friend request sent', toUser };
};

export const getPendingRequests = async (userId: string) => {
    const userWithRequests = await UserRepo.getPendingRequests(userId);
    if (!userWithRequests) throw new Error('User not found');

    return userWithRequests.friendRequests || [];
}

export const acceptFriendRequest = async (userId: string, requestId: string) => {
  // First, get the request to know who sent it
  const user = await UserRepo.findById(userId);
  if (!user) throw new Error("User not found");

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

export const rejectFriendRequest = async (userId: string, requestFromId: string) => {
    const result = await UserRepo.rejectFriendRequest(userId, requestFromId);
    return { message: 'Friend request rejected' };
}

// export const getFriends = async (userId: string): Promise<UserType[]> => {
//   if (!userId) throw new Error("User ID is required");

//   const currentUser = await User.findById(userId)
//     .populate<{ friends: UserType[] }>('friends', 'name username avatar')
//     .lean() // Optional but recommended — gives plain objects (no Mongoose docs)
//     .exec();

//   if (!currentUser) throw new Error("User not found");

//   return currentUser.friends || [];
// };

export const getFriends = async (userId: string) => {
  const user = await UserRepo.getUserWithPopulatedFriends(userId);

  if (!user) throw new Error("User not found");

  return user.friends || [];
};

///////////////////////

export const addFriend = async (currentUserId: string, friendId: string) => {
    const friend = await UserRepo.findById(friendId);
    if (!friend) throw new Error('User not found');

    const currentUser = await UserRepo.findById(currentUserId);
    if (currentUser?.friends?.includes(new Types.ObjectId(friendId))) throw new Error('Already friends');

    await addFriend(currentUserId, friendId);
    await addFriend(friendId, currentUserId);

    let conversation = await ConversationRepo.findConversationByParticipants([currentUserId, friendId]);
    if (!conversation) {
        conversation = await ConversationRepo.createConversation([currentUserId, friendId]);
    }

    return { message: 'Friend added', conversation };
};