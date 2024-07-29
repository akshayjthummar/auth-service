import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("welcome to auth service");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
    next();
});

export default app;
