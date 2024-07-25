import express, { RequestHandler } from 'express';
import { AuthControllers } from '../controllers/AuthControllers';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authControllers = new AuthControllers(userService);

router.post('/register', (async (req, res) =>
    authControllers.register(req, res)) as RequestHandler);
export default router;
