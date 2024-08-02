import {
    NextFunction,
    Request,
    RequestHandler,
    Response,
    Router,
} from "express";
import authenticate from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserControllers";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import createUserValidator from "../validators/createUser.validator";
import updateUserValidator from "../validators/updateUser.validator";
import { UpdateUserRequest } from "../types";
import logger from "../config/logger";
import listUserValidator from "../validators/listUser.validator";

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    createUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    listUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        userController.getOne(req, res, next) as unknown as RequestHandler,
);

router.patch(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    updateUserValidator,
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.update(req, res, next) as unknown as RequestHandler,
);

router.delete(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        userController.destroy(req, res, next) as unknown as RequestHandler,
);

export default router;
