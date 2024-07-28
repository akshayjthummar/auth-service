/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { NextFunction, Request, Response } from "express";
import { AuthControllers } from "../controllers/AuthControllers";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidator from "../validators/register.validator";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidator from "../validators/login.validator";
import { CredentialService } from "../services/CredentialService";
import authenticate from "../middleware/authenticate";
import { AuthRequest } from "../types";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authControllers = new AuthControllers(
    userService,
    logger,
    tokenService,
    credentialService,
);

router.post(
    "/register",
    registerValidator,
    async (req: Request, res: Response, next: NextFunction) =>
        authControllers.register(req, res, next),
);

router.post(
    "/login",
    loginValidator,
    async (req: Request, res: Response, next: NextFunction) =>
        authControllers.login(req, res, next),
);

router.get("/self", authenticate, (req: Request, res: Response) =>
    authControllers.self(req as AuthRequest, res),
);

export default router;
