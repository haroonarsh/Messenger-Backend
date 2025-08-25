export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    name?: string;
}

export interface LoginDTO {
    email: string;
    password: string;
    emailOrUsername: string;
}