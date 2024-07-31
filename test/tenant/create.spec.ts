jest.setTimeout(10000); 
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("POST /tenants", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock("http://localhost:5501");
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

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(() => {
        jwks.stop();
    });

    describe("Given all field", () => {
        it("should return 201 status code", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(201);
        });
        it("should create a tenant in the database", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
        it("should return 401 if user is not authenticated", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            const response = await request(app)
                .post("/tenants")
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(401);
        });
        it("should return 403 if user is not an admin", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send(tenantData);
            expect(response.statusCode).toBe(403);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(0);
        });
        it("should missing tenant field return status code 400", async () => {
            const tenantData = {
                name: "Tenant name",
            };

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(response.statusCode).toBe(400);
            expect(tenants).toHaveLength(0);
        });
    });
});
