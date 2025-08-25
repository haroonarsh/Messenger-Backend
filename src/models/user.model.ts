import { Schema, model, Document, Types } from "mongoose";

export interface IUser {
    username: string;
    email: string;
    password: string;
    name: string;
    avatar?: {
        public_id?: string;
        url: string;
    } | null;
    bio?: string;
    status?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Document type that includes mongoose document fields like _id
export type UserDocument = Document<Types.ObjectId> & IUser;

const userSchema = new Schema<UserDocument>(
    {
        username: { type: String, required: true, unique:  true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        avatar: {
            public_id: { type: String },
            url: { type: String },
        },
        bio: { type: String, default: '' },
        status: { type: String, default: 'Hey there! I am using Messenger.' },
    },
    { timestamps: true }
);

export default model<UserDocument>('User', userSchema);