import 'express';

declare module 'express' {
    export interface Request {
        // Attached after auth middleware
        user?: { id: string; [key: string]: any };
    }
}