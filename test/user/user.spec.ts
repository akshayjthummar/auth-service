jest.setTimeout(10000); 

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
        jwks.start();
    });
    beforeEach(async () => {
       
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });
    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all field", () => {
        it("should return the 200 status code", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`]);
            expect(response.statusCode).toBe(200);
        });
        it("should return the userdata", async () => {
            const userData = {
                firstName: "akshay",
                lastName: "thummar",
                email: "akshay@gmail.com",
                password: "akshay12321",
            };
            // Register user
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Ganerate Token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            // Add token to key

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`]);
            // Assert
            // Check if user id match with register user
            expect((response.body as Record<string, string>).id).toBe(data.id);
        });
        it("should not return the password field", async () => {
            const userData = {
                firstName: "akshay",
                lastName: "thummar",
                email: "akshay@gmail.com",
                password: "akshay12321",
            };
            // Register user
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Ganerate Token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            // Add token to key

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`]);

            // Assert
            // Check if user id match with register user
            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
        });

        it("should return 401 status code token does not exists", async () => {
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            const response = await request(app).get("/auth/self");

            expect(response.statusCode).toBe(401);
        });
    });
});
