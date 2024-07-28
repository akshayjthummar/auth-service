import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import bcrypt from "bcrypt";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import request from "supertest";
import app from "../../src/app";
import { isJWT } from "../utils";

describe("POST /auth/login", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all field", () => {
        it("should return access token and refresh token inside cookie", async () => {
            // Arrenge
            const userData = {
                firstName: "akshay",
                lastName: "thummar",
                email: "akshay@gmail.com",
                password: "akshay123216",
            };
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            // Act
            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: userData.password });

            interface Headers {
                ["set-cookie"]?: string[];
            }
            // Assert
            let accessToken = null;
            let refreshToken = null;
            const cookies = (response.headers as Headers)["set-cookie"] || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });

        it("should return the 400 if email or password is wrong", async () => {
            // Arrenge
            const userData = {
                firstName: "akshay",
                lastName: "thummar",
                email: "akshay@gmail.com",
                password: "akshay12321",
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send({ email: "wrong email", password: userData.password });

            //  Assert

            expect(response.statusCode).toBe(400);
        });
    });
});
