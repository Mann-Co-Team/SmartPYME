const request = require('supertest');
const app = require('../app'); // Import app directly to avoid starting server
const db = require('../config/db');

describe('Auth Endpoints', () => {
    let testUser = {
        nombre: 'Test',
        apellido: 'User',
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        tenant_id: 1 // Assuming tenant 1 exists
    };

    // Clean up before tests
    beforeAll(async () => {
        // Ensure tenant 1 exists or use a dynamic one
        const [tenants] = await db.execute('SELECT id_tenant FROM tenants LIMIT 1');
        if (tenants.length > 0) {
            testUser.tenant_id = tenants[0].id_tenant;
        }
    });

    afterAll(async () => {
        await db.execute('DELETE FROM usuarios WHERE email = ?', [testUser.email]);
    });

    it('should register a new public user', async () => {
        const res = await request(app)
            .post('/api/auth/register-public')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('success', true);
    });

    it('should login with the registered user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
                tenant_id: testUser.tenant_id
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('token');
    });

    it('should fail login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword',
                tenant_id: testUser.tenant_id
            });

        expect(res.statusCode).toEqual(401);
    });
});
