import express, { RequestHandler } from 'express';
import { AuthControllers } from '../controllers/AuthControllers';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import registerValidator from '../validators/register.validator';
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const authControllers = new AuthControllers(userService, logger, tokenService);

router.post('/register', registerValidator, (async (req, res, next) =>
    authControllers.register(req, res, next)) as RequestHandler);
export default router;
