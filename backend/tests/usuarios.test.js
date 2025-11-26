const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('Usuario Endpoints', () => {
    let adminToken;
    let clientToken;
    let tenantId;
    let testUserId;

    const testAdmin = {
        email: 'admin@pasteleria-dulce-sabor.com',
        password: 'Admin123!',
        tenant_slug: 'pasteleria-dulce-sabor'
    };

    const testClient = {
        nombre: 'Test',
        apellido: 'Client',
        email: `client_usuarios_${Date.now()}@example.com`,
        password: 'password123',
        tenant_id: null
    };

    const testUser = {
        nombre: 'New',
        apellido: 'User',
        email: `newuser_${Date.now()}@example.com`,
        password: 'password123',
        rol: 'empleado'
    };

    beforeAll(async () => {
        // Get Tenant
        const [tenants] = await db.execute('SELECT * FROM tenants WHERE slug = ?', [testAdmin.tenant_slug]);
        if (tenants.length === 0) throw new Error('Tenant not found');
        tenantId = tenants[0].id_tenant;
        testClient.tenant_id = tenantId;

        // Register and login client
        await request(app).post('/api/auth/register-public').send(testClient);
        const clientLogin = await request(app).post('/api/auth/login').send({
            email: testClient.email,
            password: testClient.password,
            tenant_id: tenantId
        });
        clientToken = clientLogin.body.data.token;

        // Login admin
        const adminLogin = await request(app).post('/api/auth/admin/login').send(testAdmin);
        adminToken = adminLogin.body.data.token;
    });

    afterAll(async () => {
        // Cleanup: Delete test user if created
        if (testUserId) {
            await db.execute('DELETE FROM pedidos WHERE id_usuario = ?', [testUserId]);
            await db.execute('DELETE FROM usuarios WHERE id_usuario = ?', [testUserId]);
        }

        // Cleanup: Delete test client
        if (testClient.email) {
            const [usuarios] = await db.execute('SELECT id_usuario FROM usuarios WHERE email = ?', [testClient.email]);
            if (usuarios.length > 0) {
                const userId = usuarios[0].id_usuario;
                await db.execute('DELETE FROM pedidos WHERE id_usuario = ?', [userId]);
                await db.execute('DELETE FROM usuarios WHERE id_usuario = ?', [userId]);
            }
        }
    });

    it('should create a user as admin or handle limit', async () => {
        const res = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(testUser);

        if (res.statusCode === 201) {
            // Success case: user created
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id_usuario');
            testUserId = res.body.data.id_usuario;
        } else if (res.statusCode === 400 && res.body.message.includes('límite')) {
            // Limit reached case
            expect(res.body.message).toMatch(/límite de usuarios/i);
            console.log('User limit reached, skipping user creation tests');
        } else {
            // Unexpected error
            throw new Error(`Unexpected response: ${res.statusCode} - ${res.body.message}`);
        }
    });

    it('should fail to create user as client', async () => {
        const res = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${clientToken}`)
            .send(testUser);

        expect(res.statusCode).toEqual(403);
    });

    it('should list users as admin', async () => {
        const res = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should fail to list users as client', async () => {
        const res = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toEqual(403);
    });

    it('should update user as admin', async () => {
        if (!testUserId) {
            console.log('Skipping update test: no user was created');
            return;
        }

        const updatedData = {
            nombre: 'Updated Name',
            rol: 'admin'
        };

        const res = await request(app)
            .put(`/api/usuarios/${testUserId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updatedData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should fail to update user as client', async () => {
        const res = await request(app)
            .put(`/api/usuarios/${testUserId}`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ rol: 'admin' });

        expect(res.statusCode).toEqual(403);
    });

    it('should get user statistics as admin', async () => {
        const res = await request(app)
            .get('/api/usuarios/stats')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('total');
        expect(res.body.data).toHaveProperty('porRol');
    });

    it('should delete user as admin', async () => {
        if (!testUserId) {
            console.log('Skipping delete test: no user was created');
            return;
        }

        const res = await request(app)
            .delete(`/api/usuarios/${testUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        // Mark as deleted so cleanup doesn't try to delete again
        testUserId = null;
    });

    it('should fail to delete user as client', async () => {
        // Create a new user to test deletion failure
        const createRes = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                nombre: 'User',
                apellido: 'ToDelete',
                email: `todelete_${Date.now()}@example.com`,
                password: 'password123',
                rol: 'empleado'
            });

        // Only test if user was created (not at limit)
        if (createRes.statusCode === 201) {
            const userId = createRes.body.data.id_usuario;

            const res = await request(app)
                .delete(`/api/usuarios/${userId}`)
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toEqual(403);

            // Cleanup
            await db.execute('DELETE FROM usuarios WHERE id_usuario = ?', [userId]);
        } else {
            console.log('Skipping delete permission test: user limit reached');
        }
    });

    it('should validate required fields when creating user', async () => {
        const invalidUser = {
            nombre: 'Test'
            // Missing required fields
        };

        const res = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(invalidUser);

        expect(res.statusCode).toEqual(400);
    });

    it('should prevent duplicate email', async () => {
        const duplicateUser = {
            ...testUser,
            email: testAdmin.email // Try to use admin's email
        };

        const res = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(duplicateUser);

        expect(res.statusCode).toEqual(400);
    });
});
