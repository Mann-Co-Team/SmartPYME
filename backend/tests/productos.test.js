const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('Producto Endpoints', () => {
    let adminToken;
    let clientToken;
    let tenantId;
    let categoryId;
    let testProductId;

    const testAdmin = {
        email: 'admin@pasteleria-dulce-sabor.com',
        password: 'Admin123!',
        tenant_slug: 'pasteleria-dulce-sabor'
    };

    const testClient = {
        nombre: 'Test',
        apellido: 'Client',
        email: `client_productos_${Date.now()}@example.com`,
        password: 'password123',
        tenant_id: null
    };

    const testProduct = {
        nombre: `Test Product ${Date.now()}`,
        descripcion: 'Test product description',
        precio: 5000,
        stock: 10,
        activo: true
    };

    beforeAll(async () => {
        // Get Tenant
        const [tenants] = await db.execute('SELECT * FROM tenants WHERE slug = ?', [testAdmin.tenant_slug]);
        if (tenants.length === 0) throw new Error('Tenant not found');
        tenantId = tenants[0].id_tenant;
        testClient.tenant_id = tenantId;

        // Get or create a category
        const [categories] = await db.execute('SELECT id_categoria FROM categorias WHERE id_tenant = ? LIMIT 1', [tenantId]);
        if (categories.length > 0) {
            categoryId = categories[0].id_categoria;
        } else {
            const [result] = await db.execute(
                'INSERT INTO categorias (nombre, descripcion, id_tenant) VALUES (?, ?, ?)',
                ['Test Category', 'Test category for products', tenantId]
            );
            categoryId = result.insertId;
        }

        testProduct.id_categoria = categoryId;

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
        // Cleanup: Delete test product if created
        if (testProductId) {
            await db.execute('DELETE FROM productos WHERE id_producto = ?', [testProductId]);
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

    it('should create a product as admin', async () => {
        const res = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(testProduct);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id_producto');
        testProductId = res.body.data.id_producto;
    });

    it('should fail to create product as client', async () => {
        const res = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${clientToken}`)
            .send(testProduct);

        expect(res.statusCode).toEqual(403);
    });

    it('should list products for client', async () => {
        const res = await request(app)
            .get('/api/productos')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get a specific product', async () => {
        const res = await request(app)
            .get(`/api/productos/${testProductId}`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('nombre', testProduct.nombre);
    });

    it('should update product as admin', async () => {
        const updatedData = {
            nombre: `Updated ${testProduct.nombre}`,
            precio: 6000
        };

        const res = await request(app)
            .put(`/api/productos/${testProductId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updatedData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should fail to update product as client', async () => {
        const res = await request(app)
            .put(`/api/productos/${testProductId}`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ precio: 7000 });

        expect(res.statusCode).toEqual(403);
    });

    it('should delete product as admin', async () => {
        const res = await request(app)
            .delete(`/api/productos/${testProductId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        // Mark as deleted so cleanup doesn't try to delete again
        testProductId = null;
    });

    it('should fail to delete product as client', async () => {
        // Create a new product to test deletion failure
        const createRes = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(testProduct);

        const productId = createRes.body.data.id_producto;

        const res = await request(app)
            .delete(`/api/productos/${productId}`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toEqual(403);

        // Cleanup
        await db.execute('DELETE FROM productos WHERE id_producto = ?', [productId]);
    });
});
