export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    name?: string;
    bio?: string;
}

export interface LoginDTO {
    password: string;
    emailOrUsername: string;
}

export interface UserType {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: {
        url: string;
    };
    bio?: string;
}