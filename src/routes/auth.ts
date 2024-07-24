import express from 'express';
import { AuthControllers } from '../controllers/AuthControllers';

const router = express.Router();

const authControllers = new AuthControllers();

router.post('/register', (req, res) => authControllers.register(req, res));
export default router;
