import "reflect-metadata";
import express, { Application, Request, Response } from "express";

import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import usersRouter from "./routes/user";
import { Config } from "./config";
import cors from "cors";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app: Application = express();
const ALLOWED_DOMAINS = [Config.CLIENT_UI_DOMAIN, Config.ADMIN_UI_DOMAIN];

app.use(cors({ origin: ALLOWED_DOMAINS as string[], credentials: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("welcome to auth service");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", usersRouter);

app.use(globalErrorHandler);

export default app;
