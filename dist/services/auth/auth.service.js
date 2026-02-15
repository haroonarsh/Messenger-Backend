"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const user_repo_1 = require("../../repositories/user.repo");
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
const cloudinary_upload_1 = require("../../utils/cloudinary-upload");
async function register(payload, file) {
    // 1. check duplicates
    const existingEmail = await (0, user_repo_1.findByEmail)(payload.email);
    if (existingEmail) {
        throw Object.assign(new Error('Email already in use'), { status: 400 });
    }
    const existingUsername = await (0, user_repo_1.findByUsername)(payload.username);
    if (existingUsername) {
        throw Object.assign(new Error('Username already in use'), { status: 400 });
    }
    // 2. hash password
    const hashedPassword = await (0, hash_1.hashPassword)(payload.password);
    // 3. upload avatar if file is provided
    let avatar = null;
    if (file && file.buffer) {
        const res = await (0, cloudinary_upload_1.uploadBufferToCloudinary)(file.buffer, 'messenger/avatars');
        avatar = { url: res.secure_url, public_id: res.public_id };
    }
    // 4. create user
    const user = (await (0, user_repo_1.createUser)({
        username: payload.username,
        email: payload.email,
        password: hashedPassword,
        name: payload.name,
        bio: payload.bio,
        avatar,
    }));
    // 5. sign token
    const token = (0, jwt_1.signToken)({ sub: user._id.toString(), id: user._id.toString(), username: user.username, email: user.email, name: user.name, avatar: user.avatar, bio: user.bio, status: user.status, createdAt: user.createdAt, updatedAt: user.updatedAt, });
    // 6. retern safe user data
    const { password: _p, ...safeUser } = user.toObject();
    return { user: safeUser, token };
}
async function login(payload) {
    const { emailOrUsername, password } = payload;
    // find by email or username
    let user = await (0, user_repo_1.findByEmail)(emailOrUsername);
    if (!user) {
        user = await (0, user_repo_1.findByUsername)(emailOrUsername);
    }
    if (!user) {
        throw Object.assign(new Error('Invalid credentials'), { status: 400 });
    }
    const match = await (0, hash_1.comparePassword)(password, user.password);
    if (!match) {
        throw Object.assign(new Error('Invalid credentials'), { status: 400 });
    }
    const token = (0, jwt_1.signToken)({ sub: user._id.toString(), id: user._id.toString(), username: user.username, email: user.email, name: user.name, avatar: user.avatar, bio: user.bio, status: user.status, createdAt: user.createdAt, updatedAt: user.updatedAt, });
    const { password: _p, ...safeUser } = user.toObject();
    return { user: safeUser, token };
}
// export async function getMe(token: string) {
// }
