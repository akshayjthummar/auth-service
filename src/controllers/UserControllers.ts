import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import {
    CreateUserRequest,
    UpdateUserRequest,
    UserQueryParams,
} from "../types";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { firstName, lastName, email, password, tenantId, role } =
            req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });

            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validateQuery = matchedData(req, { onlyValidData: true });

        try {
            const [users, count] = await this.userService.getAll(
                validateQuery as UserQueryParams,
            );
            this.logger.info("All users have been fetched");
            res.json({
                currentPage: validateQuery.currentPage as number,
                perPage: validateQuery.perPage as number,
                total: count,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid params"));
            return;
        }
        try {
            const user = await this.userService.findById(Number(userId));
            this.logger.info("User has been fetched", { id: user?.id });
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid params"));
            return;
        }
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { firstName, lastName, role, tenantId } = req.body;
        try {
            await this.userService.update(
                { firstName, lastName, role, tenantId },
                Number(userId),
            );
            this.logger.info("User has been updated", { id: userId });

            res.json({ id: Number(userId) });
        } catch (error) {
            next(error);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid params"));
            return;
        }
        try {
            await this.userService.delete(Number(userId));
            this.logger.info("User has been deleted", {
                id: Number(userId),
            });
            res.json({ id: Number(userId) });
        } catch (error) {
            next(error);
        }
    }
}
