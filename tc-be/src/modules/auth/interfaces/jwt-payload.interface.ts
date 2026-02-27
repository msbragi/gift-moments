export interface JwtPayload {
    sub: number;
    email: string;
    role?: 'super_user' | 'admin' | null;
    disabled?: boolean;
    iat?: number;
    exp?: number;
}