import { Logger } from "winston";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest, TenantQueryParams } from "../types";
import { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, address } = req.body;
        this.logger.debug("Request for creating tenant", { name, address });
        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info("Tenant has been created", { id: tenant.id });
            res.status(201).json({ id: tenant.id });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validateQuery = matchedData(req, { onlyValidData: true });
        try {
            const [tenants, count] = await this.tenantService.getAll(
                validateQuery as TenantQueryParams,
            );
            this.logger.info("All tenant have been fetched");
            res.json({
                currentPage: validateQuery.currentPage as number,
                perPage: validateQuery.perPage as number,
                total: count,
                data: tenants,
            });
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        try {
            const tenants = await this.tenantService.getTenantById(
                Number(tenantId),
            );
            this.logger.info("Tenant have been fetched");
            res.json(tenants);
        } catch (error) {
            next(error);
        }
    }

    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, address } = req.body;
        this.logger.debug("Request for updating a tenant", req.body);

        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        try {
            await this.tenantService.updateTenantById(Number(tenantId), {
                name,
                address,
            });
            this.logger.info("Tenant has been updated", { id: tenantId });

            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        try {
            await this.tenantService.deleteTenantById(Number(tenantId));
            this.logger.info("Tenant has been deleted", { id: tenantId });

            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
        }
    }
}
