export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    name?: string;
}

export interface LoginDTO {
    password: string;
    emailOrUsername: string;
}