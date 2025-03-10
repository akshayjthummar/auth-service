import { Request } from "express";

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId?: number;
}
export interface RegisterUserRequest extends Request {
    body: UserData;
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
        tenant: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface IRefreshTokenPayload {
    id: string;
}

export interface ITenant {
    name: string;
    address: string;
}

export interface CreateTenantRequest extends Request {
    body: ITenant;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}

export interface UpdateUserData {
    firstName: string;
    lastName: string;
    role: string;
    tenantId: number;
}

export interface UpdateUserRequest extends Request {
    body: UpdateUserData;
}
export interface UserQueryParams {
    currentPage: number;
    perPage: number;
    q: string;
    role: string;
}

export interface TenantQueryParams {
    currentPage: number;
    perPage: number;
    q: string;
}
