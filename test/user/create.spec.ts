jest.setTimeout(10000); 
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Tenant } from "../../src/entity/Tenant";
import { createTenant } from "../utils";

describe("POST /users", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
        jwks.start();
        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
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
        it("should persist the user in the database", async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            const userData = {
                firstName: "akshay",
                lastName: "thummar",
                email: "akshay@gmail.com",
                password: "akshay12321",
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it("should create a manager user", async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));

            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            // Register user
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            // Add token to cookie
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });

        it("should return 403 if non admin user tries to create a user", async () => {
            // Create tenant first
            const tenant = await createTenant(connection.getRepository(Tenant));

            const nonAdminToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
                tenantId: tenant.id,
            };

            // Add token to cookie
            const response = await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${nonAdminToken}`])
                .send(userData);

            expect(response.statusCode).toBe(403);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(0);
        });
    });
});
