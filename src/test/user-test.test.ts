import supertest from 'supertest';
import { app } from '../index';
import { prismaClient } from '../application/database/database';

const request = supertest(app);

describe('User API', () => {

    afterAll(async () => {
        // Tutup koneksi Prisma setelah semua test
        await prismaClient.user.deleteMany();
    });

    describe('POST /api/users/register', () => {
        it('should register a new user', async () => {
            const res = await request.post('/api/users/register')
                .send({
                    username: 'testuser2',
                    password: 'password123',
                    name: 'Test User'
                });

            expect(res.status).toBe(201);
        });

        it('should not allow duplicate usernames', async () => {
            // Register user pertama
            await request.post('/api/users/register')
                .send({ username: 'duplicate', password: 'pass1', name: 'User 1' });

            // Coba register dengan username yang sama
            const res = await request.post('/api/users/register')
                .send({ username: 'duplicate', password: 'pass2', name: 'User 2' });

            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined()
            // console.log(res)
        });

        it('should validate input data', async () => {
            const res = await request.post('/api/users/register')
                .send({ username: '', password: '', name: 'A' });

            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined()
            // console.log(res)
        });
    });

    describe('POST /api/users/login', () => {

        //! should login as user
        it('should login as user', async () => {
            const newUser = await request.post('/api/users/register').send({
                username: 'testuser2',
                password: 'password123',
            })
            const res = await request.post('/api/users/login')
                .send({
                    username: 'testuser2',
                    password: 'password123',
                });
            expect(res.status).toBe(200);
            // console.log(res.body);
        });

        //! should has acces token
        it('should has acces token', async () => {
            const newUser = await request.post('/api/users/register').send({
                username: 'testuser2',
                password: 'password123',
            })
            const res = await request.post('/api/users/login')
                .send({
                    username: 'testuser2',
                    password: 'password123',
                });
            // console.log(res.body);
            expect(res.body.data).toHaveProperty('accessToken');
        });
        //! should not login as user
        it('should not login as user', async () => {
            const res = await request.post('/api/users/login')
                .send({
                    username: 'testnotusers',
                    password: 'password123',
                });
            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined()
            // console.log(res.body);
        });

        
    });

    describe('GET /api/contact', () => {
        //! should get all contacts
        it('should get all contacts', async () => {

            await request.post('/api/users/register').send({
                username: 'testuser2',
                password: 'password123',
            })
            const userLogin = await request.post('/api/users/login')
                .send({
                    username: 'testuser2',
                    password: 'password123',
                });
            const res = await request.get('/api/contact')
                .set('Authorization', 'Bearer ' + userLogin.body.data.accessToken);
            expect(res.status).toBe(200);
            // expect(res.body.data).toBeDefined();
            // console.log(res.body);

        })

        // Tambahkan test untuk endpoint lain seperti login, getProfile, dll.
    });
})