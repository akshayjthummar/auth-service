/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/require-await */
import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utils';
import { User } from '../../src/entity/User';

describe('POST /auth/register', () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        await truncateTables(connection);
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
    });
    describe('missing fileds', () => {});
});