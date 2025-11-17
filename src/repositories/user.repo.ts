import { query } from "express";
import User, { UserDocument } from "../models/user.model";

export const createUser = async (payload: Partial<UserDocument>): Promise<UserDocument> => {
    const user = new User(payload);
    return user.save();
};

export const findByEmail = async (email: string): Promise<UserDocument | null> => {
    return User.findOne({ email }).exec();
};

export const findByUsername = async (username: string): Promise<UserDocument | null> => {
    return User.findOne({ username }).exec();
};

export const findById = async (id: string): Promise<UserDocument | null> => {
    return User.findById(id).select("-password").exec();
};

export const updateById = async (id: string, payload: Partial<UserDocument>): Promise<UserDocument | null> => {
    return User.findByIdAndUpdate(id, payload, { new: true }).exec();
};

export const deleteById = async (id: string): Promise<UserDocument | null> => {
    return User.findByIdAndDelete(id).exec();
};

export const searchUsers = async (query: string, excludeId: string): Promise<UserDocument[]> => {
    return User.find({
        $or: [{ username: { $regex: query, $options: "i" } }, { name: { $regex: query, $options: "i" } }],
        _id: { $ne: excludeId },
    }).select("name username avatar").exec();
};

export const sendFriendRequest = async (fromId: string, toId: string): Promise<UserDocument> => {
    return User.findByIdAndUpdate(
        toId,
        { $push: { friendRequests: { from: fromId } } },
        { new: true }
    ).exec() as Promise<UserDocument>;
};

export const getPendingRequests = async (userId: string): Promise<UserDocument[]> => {
    return User.findById(userId).populate('friendRequests.from', 'name username avatar').exec();
}

export const acceptFriendRequest = async (userId: string, requestFromId: string): Promise<UserDocument> => {
    const updated = await User.findByIdAndUpdate(
        userId,
        { 
            $pull: { friendRequests: { from: requestFromId, status: 'pending' } },
            $push: { friends: requestFromId },
            $addToSet: { friendRequests: { from: requestFromId, status: 'accepted' } }
        },
        { new: true }
    ).exec();

    // Mutual friend add
    await User.findByIdAndUpdate(requestFromId, { $push: { friends: userId } }).exec();

    return updated as UserDocument;
};

export const addFriend = async (userId: string, friendId: string): Promise<UserDocument> => {
    return User.findByIdAndUpdate(userId, { $push: { friends: friendId } }, { new: true }).exec() as Promise<UserDocument>;
};