import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Tenant } from "../../src/entity/Tenant";
import { createTenant } from "../utils";

describe.skip("POST /users", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });

    afterEach(() => {
        jwks.stop();
    });
    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all field", () => {
        it.skip("should persist the user in the database", async () => {
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
            const userData = {
                firstName: "akshay",
                lastName: "thummar",
                email: "akshay@gmail.com",
                password: "akshay12321",
                tenantId: 1,
            };

            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });

        it.todo("should return 403 if non admin user tries to create a user");
    });
});
