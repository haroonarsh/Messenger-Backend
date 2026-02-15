"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFriend = exports.getUserWithPopulatedFriends = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.getPendingRequests = exports.sendFriendRequest = exports.searchUsers = exports.deleteById = exports.updateById = exports.findById = exports.findByUsername = exports.findByEmail = exports.createUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const createUser = async (payload) => {
    const user = new user_model_1.default(payload);
    return user.save();
};
exports.createUser = createUser;
const findByEmail = async (email) => {
    return user_model_1.default.findOne({ email }).exec();
};
exports.findByEmail = findByEmail;
const findByUsername = async (username) => {
    return user_model_1.default.findOne({ username }).exec();
};
exports.findByUsername = findByUsername;
const findById = async (id) => {
    return user_model_1.default.findById(id).select("-password").exec();
};
exports.findById = findById;
const updateById = async (id, payload) => {
    return user_model_1.default.findByIdAndUpdate(id, payload, { new: true }).exec();
};
exports.updateById = updateById;
const deleteById = async (id) => {
    return user_model_1.default.findByIdAndDelete(id).exec();
};
exports.deleteById = deleteById;
const searchUsers = async (query, excludeId) => {
    return user_model_1.default.find({
        $or: [{ username: { $regex: query, $options: "i" } }, { name: { $regex: query, $options: "i" } }],
        _id: { $ne: excludeId },
    }).select("name username avatar").exec();
};
exports.searchUsers = searchUsers;
const sendFriendRequest = async (fromId, toId) => {
    return user_model_1.default.findByIdAndUpdate(toId, { $push: { friendRequests: { from: fromId } } }, { new: true }).exec();
};
exports.sendFriendRequest = sendFriendRequest;
const getPendingRequests = async (userId) => {
    return await user_model_1.default.findById(userId).populate('friendRequests.from', 'name username avatar').exec();
};
exports.getPendingRequests = getPendingRequests;
const acceptFriendRequest = async (userId, requestFromId) => {
    // Step 1: Pull the pending request
    await user_model_1.default.findByIdAndUpdate(userId, {
        $pull: { friendRequests: { from: requestFromId, status: 'pending' } }
    }).exec();
    // Step 2: Add to friends list (current user)
    const updatedUser = await user_model_1.default.findByIdAndUpdate(userId, {
        $addToSet: { friends: requestFromId } // $addToSet prevents duplicates
    }, { new: true }).exec();
    // Step 3: Add mutual friendship (sender adds receiver)
    await user_model_1.default.findByIdAndUpdate(requestFromId, {
        $addToSet: { friends: userId }
    }).exec();
    return updatedUser;
};
exports.acceptFriendRequest = acceptFriendRequest;
const rejectFriendRequest = async (userId, requestFromId) => {
    const updated = await user_model_1.default.findByIdAndUpdate(userId, { $pull: { friendRequests: { from: requestFromId, status: 'pending' } } }, { new: true }).exec();
    return updated;
};
exports.rejectFriendRequest = rejectFriendRequest;
const getUserWithPopulatedFriends = async (userId) => {
    return await user_model_1.default.findById(userId)
        .populate('friends', 'name username avatar')
        .lean() // Clean plain object
        .exec();
};
exports.getUserWithPopulatedFriends = getUserWithPopulatedFriends;
const addFriend = async (userId, friendId) => {
    return user_model_1.default.findByIdAndUpdate(userId, { $push: { friends: friendId } }, { new: true }).exec();
};
exports.addFriend = addFriend;
