/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/require-await */
import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

describe('POST /auth/register', () => {
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
    describe('Given all field', () => {
        it('should return the 201 status code', async () => {
            const userdata = {
                firstName: 'akshay',
                lastName: 'thummar',
                email: 'akshaythummar34@gmail.com',
                password: 'secret',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(userdata);
            expect(response.statusCode).toBe(201);
        });
        it('valid json response', async () => {
            const userdata = {
                firstName: 'akshay',
                lastName: 'thummar',
                email: 'akshaythummar34@gmail.com',
                password: 'secret',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(userdata);
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });
        it('should persist the user in the database', async () => {
            const userdata = {
                firstName: 'akshay',
                lastName: 'thummar',
                email: 'akshaythummar34@gmail.com',
                password: 'secret',
            };
            await request(app).post('/auth/register').send(userdata);
            const useRepository = connection.getRepository(User);
            const user = await useRepository.find();
            expect(user).toHaveLength(1);
            expect(user[0].firstName).toBe(userdata.firstName);
            expect(user[0].lastName).toBe(userdata.lastName);
            expect(user[0].email).toBe(userdata.email);
        });
        it('should assign a customer role', async () => {
            const userdata = {
                firstName: 'akshay',
                lastName: 'thummar',
                email: 'akshaythummar34@gmail.com',
                password: 'secret',
            };
            await request(app).post('/auth/register').send(userdata);
            const useRepository = connection.getRepository(User);
            const users = await useRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });
        it('should store the hashed password in the database', async () => {
            const userdata = {
                firstName: 'akshay',
                lastName: 'thummar',
                email: 'akshaythummar34@gmail.com',
                password: 'secret',
            };
            await request(app).post('/auth/register').send(userdata);
            const useRepository = connection.getRepository(User);
            const users = await useRepository.find();
            expect(users[0].password).not.toBe(userdata.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });
        it('this shoud return 400 status code if email is already exists', async () => {
            // Arrange
            const userdata = {
                firstName: 'akshay',
                lastName: 'thummar',
                email: 'akshaythummar34@gmail.com',
                password: 'secret',
            };
            const useRepository = connection.getRepository(User);
            await useRepository.save({ ...userdata, role: Roles.CUSTOMER });
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userdata);
            const user = await useRepository.find();
            // Assert
            expect(response.statusCode).toBe(400);
            expect(user).toHaveLength(1);
        });
    });

    describe('missing fileds', () => {
        it('should retuern 400 status code if email  does not exist', async () => {
            // Arrange
            const userdata = {
                firstName: 'akshay',
                lastName: 'thummar',
                email: '',
                password: 'secret',
            };

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userdata);
            const useRepository = connection.getRepository(User);
            const user = await useRepository.find();
            //   Assert
            expect(response.statusCode).toBe(400);
            expect(user).toHaveLength(0);
        });
    });
});
