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
    friends?: Types.ObjectId[];
    friendRequests?: {
        from: Types.ObjectId;
        status: 'pending' | 'accepted' | 'rejected';
        createdAt: Date;
    }[];
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
        friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        friendRequests: [{
            from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
            createdAt: { type: Date, default: Date.now },
        }],
    },
    { timestamps: true }
);

// index 
userSchema.index({ 'friendRequests.from': 1 });

export default model<UserDocument>('User', userSchema);