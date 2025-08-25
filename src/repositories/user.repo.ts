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
    return User.findById(id).exec();
};