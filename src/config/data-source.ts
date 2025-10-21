import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from ".";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,

    synchronize: false,
    logging: false,

    // ✅ Important: use array of strings OR path.join, not nested arrays
    entities: [__dirname + "/../entity/*.{ts,js}"],
    migrations: [__dirname + "/../migration/*.{ts,js}"],
    subscribers: [],
});
