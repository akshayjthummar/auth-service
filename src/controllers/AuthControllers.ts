import { NextFunction, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { Roles } from "../constants";

export class AuthControllers {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialPassword: CredentialService,
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { firstName, lastName, email, password } = req.body;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        this.logger.debug("New Request to register a user", {
            firstName,
            lastName,
            email,
            password: "******",
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                tenant: user.tenant ? String(user.tenant.id) : "",
            };

            const accessToken = this.tokenService.ganerateAccessToken(payload);

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.ganerateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, //1h,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, //365day,
                httpOnly: true,
            });
            this.logger.info("User has been registerd", { id: user.id });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { email, password } = req.body;
        this.logger.debug("New Request to login a user", {
            email,
            password: "******",
        });

        // Check if username(email) is exist in db
        // Compare Password
        // Ganarate Token
        // Add token to cookie
        // Return the response (id)
        try {
            const user = await this.userService.findByEmail(email);
            if (!user) {
                const err = createHttpError(
                    400,
                    "Email or password does not match",
                );
                next(err);
                return;
            }

            const passwordMatch = await this.credentialPassword.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const err = createHttpError(
                    400,
                    "Email or password does not match",
                );
                next(err);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                tenant: user.tenant ? String(user.tenant.id) : "",
            };

            const accessToken = this.tokenService.ganerateAccessToken(payload);

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.ganerateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, //1h,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, //365day,
                httpOnly: true,
            });
            this.logger.info("user has been logged in", { id: user.id });

            res.status(200).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));
        res.json({ ...user, password: undefined });
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
                tenant: req.auth.tenant,
                firstName: req.auth.firstName,
                lastName: req.auth.lastName,
                email: req.auth.email,
            };
            const accessToken = this.tokenService.ganerateAccessToken(payload);

            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                const err = createHttpError(
                    400,
                    "User with the token could not find",
                );
                next(err);
                return;
            }

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // delete old refreshtoken

            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.ganerateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, //1h,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, //365day,
                httpOnly: true,
            });
            this.logger.info("User has been registerd", { id: user.id });
            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info("Refresh token has been deleted", {
                id: req.auth.id,
            });
            this.logger.info("User has been logged out", { id: req.auth.sub });
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return res.json({});
        } catch (error) {
            next(error);
            return;
        }
    }
}
