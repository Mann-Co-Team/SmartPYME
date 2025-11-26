const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('Categoria Endpoints', () => {
    let adminToken;
    let clientToken;
    let tenantId;
    let testCategoryId;

    const testAdmin = {
        email: 'admin@pasteleria-dulce-sabor.com',
        password: 'Admin123!',
        tenant_slug: 'pasteleria-dulce-sabor'
    };

    const testClient = {
        nombre: 'Test',
        apellido: 'Client',
        email: `client_categorias_${Date.now()}@example.com`,
        password: 'password123',
        tenant_id: null
    };

    const testCategory = {
        nombre: `Test Category ${Date.now()}`,
        descripcion: 'Test category description',
        activo: true
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
        // Cleanup: Delete test category if created
        if (testCategoryId) {
            // First delete any products in this category
            await db.execute('DELETE FROM productos WHERE id_categoria = ?', [testCategoryId]);
            await db.execute('DELETE FROM categorias WHERE id_categoria = ?', [testCategoryId]);
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

    it('should create a category as admin', async () => {
        const res = await request(app)
            .post('/api/categorias')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(testCategory);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id_categoria');
        testCategoryId = res.body.data.id_categoria;
    });

    it('should fail to create category as client', async () => {
        const res = await request(app)
            .post('/api/categorias')
            .set('Authorization', `Bearer ${clientToken}`)
            .send(testCategory);

        expect(res.statusCode).toEqual(403);
    });

    it('should list categories for client', async () => {
        const res = await request(app)
            .get('/api/categorias')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should update category as admin', async () => {
        const updatedData = {
            nombre: `Updated ${testCategory.nombre}`,
            descripcion: 'Updated description'
        };

        const res = await request(app)
            .put(`/api/categorias/${testCategoryId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updatedData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should fail to update category as client', async () => {
        const res = await request(app)
            .put(`/api/categorias/${testCategoryId}`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ nombre: 'Hacked Category' });

        expect(res.statusCode).toEqual(403);
    });

    it('should toggle category active status as admin', async () => {
        const res = await request(app)
            .patch(`/api/categorias/${testCategoryId}/toggle`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should delete category as admin', async () => {
        const res = await request(app)
            .delete(`/api/categorias/${testCategoryId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        // Mark as deleted so cleanup doesn't try to delete again
        testCategoryId = null;
    });

    it('should fail to delete category as client', async () => {
        // Create a new category to test deletion failure
        const createRes = await request(app)
            .post('/api/categorias')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ nombre: 'Category to Delete', descripcion: 'Test' });

        const categoryId = createRes.body.data.id_categoria;

        const res = await request(app)
            .delete(`/api/categorias/${categoryId}`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toEqual(403);

        // Cleanup
        await db.execute('DELETE FROM categorias WHERE id_categoria = ?', [categoryId]);
    });
});
