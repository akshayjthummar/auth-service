import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { TokenService } from '../services/TokenService';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/CredentialService';

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
            return res.status(400).json({ errors: result.array() });
        }
        this.logger.debug('New Request to register a user', {
            firstName,
            lastName,
            email,
            password: '******',
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.ganerateAccessToken(payload);

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.ganerateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1h,
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //365day,
                httpOnly: true,
            });
            this.logger.info('User has been registerd', { id: user.id });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { email, password } = req.body;
        this.logger.debug('New Request to login a user', {
            email,
            password: '******',
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
                    'Email or password does not match',
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
                    'Email or password does not match',
                );
                next(err);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.ganerateAccessToken(payload);

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.ganerateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1h,
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //365day,
                httpOnly: true,
            });
            this.logger.info('user has been logged in', { id: user.id });
            res.status(200).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
