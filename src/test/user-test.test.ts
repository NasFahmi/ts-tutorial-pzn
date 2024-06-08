import supertest from 'supertest';
import { app } from '../index';
import { prismaClient } from '../application/database/database';

const request = supertest(app);

describe('User API', () => {


    afterAll(async () => {
        // Tutup koneksi Prisma setelah semua test
        await prismaClient.user.deleteMany();
    });

    describe('POST /api/users/', () => {
        it('should register a new user', async () => {
            const res = await request.post('/api/users')
                .send({
                    username: 'testuser',
                    password: 'password123',
                    name: 'Test User'
                });

            expect(res.status).toBe(201);
        });

        it('should not allow duplicate usernames', async () => {
            // Register user pertama
            await request.post('/api/users')
                .send({ username: 'duplicate', password: 'pass1', name: 'User 1' });

            // Coba register dengan username yang sama
            const res = await request.post('/api/users')
                .send({ username: 'duplicate', password: 'pass2', name: 'User 2' });

            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined()
            // console.log(res)
        });

        it('should validate input data', async () => {
            const res = await request.post('/api/users')
                .send({ username: '', password: '', name: 'A' });

            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined()
            // console.log(res)
        });
    });

    // Tambahkan test untuk endpoint lain seperti login, getProfile, dll.
});