import { RegisterDTO, LoginDTO } from "../../interfaces/auth.interface";
import { createUser, findByEmail, findById, findByUsername } from "../../repositories/user.repo";
import { hashPassword, comparePassword } from "../../utils/hash";
import { signToken, verifyToken } from "../../utils/jwt";
import { uploadBufferToCloudinary } from "../../utils/cloudinary-upload";
import { UserDocument } from "../../models/user.model";

export async function register(payload: RegisterDTO, file?: Express.Multer.File) {
    // 1. check duplicates
    const existingEmail = await findByEmail(payload.email);
    if (existingEmail) {
        throw Object.assign(new Error('Email already in use'), { status: 400 });
    }

    const existingUsername = await findByUsername(payload.username);
    if (existingUsername) {
        throw Object.assign(new Error('Username already in use'), { status: 400 });
    }

    // 2. hash password
    const hashedPassword = await hashPassword(payload.password);

    // 3. upload avatar if file is provided
    let avatar: { url: string; public_id?: string } | null = null;
    if (file && file.buffer) {
        const res = await uploadBufferToCloudinary(file.buffer, 'messenger/avatars');
        avatar = { url: res.secure_url, public_id: res.public_id };
    }

    // 4. create user
    const user = (await createUser({
        username: payload.username,
        email: payload.email,
        password: hashedPassword,
        name: payload.name,
        bio: payload.bio,
        avatar,
    })) as UserDocument;

    // 5. sign token
    const token = signToken({ sub: user._id.toString(), id: user._id.toString(), username: user.username, email: user.email, name: user.name, avatar: user.avatar, bio: user.bio, status: user.status, createdAt: user.createdAt, updatedAt: user.updatedAt, });

    // 6. retern safe user data
    const { password: _p, ...safeUser } = user.toObject();
    return { user: safeUser as Partial<UserDocument>, token };
}

export async function login(payload: LoginDTO) {
    const { emailOrUsername, password } = payload;

    // find by email or username
    let user = await findByEmail(emailOrUsername);
    if (!user) {
        user = await findByUsername(emailOrUsername);
    }

    if (!user) {
        throw Object.assign(new Error('Invalid credentials'), { status: 400 });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
        throw Object.assign(new Error('Invalid credentials'), { status: 400 });
    }

    const token = signToken({ sub: user._id.toString(), id: user._id.toString(), username: user.username, email: user.email, name: user.name, avatar: user.avatar, bio: user.bio, status: user.status, createdAt: user.createdAt, updatedAt: user.updatedAt, });

    const { password: _p, ...safeUser } = user.toObject();
    return { user: safeUser as Partial<UserDocument>, token };
}

// export async function getMe(token: string) {

// }