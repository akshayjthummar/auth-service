/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/require-await */
import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
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
    });
    describe('missing fileds', () => {});
});
