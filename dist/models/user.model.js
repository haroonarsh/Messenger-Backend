"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatar: {
        public_id: { type: String },
        url: { type: String },
    },
    bio: { type: String, default: '' },
    status: { type: String, default: 'Hey there! I am using Messenger.' },
    friends: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{
            from: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
            createdAt: { type: Date, default: Date.now },
        }],
}, { timestamps: true });
// index 
userSchema.index({ 'friendRequests.from': 1 });
exports.default = (0, mongoose_1.model)('User', userSchema);
