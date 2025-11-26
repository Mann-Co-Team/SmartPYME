const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('Pedido Endpoints', () => {
    let adminToken;
    let clientToken;
    let tenantId;
    let productId;
    let testClient = {
        nombre: 'Test',
        apellido: 'Client',
        email: `client_${Date.now()}@example.com`,
        password: 'password123',
        tenant_id: null
    };
    let testAdmin = {
        email: 'admin@pasteleria-dulce-sabor.com',
        password: 'Admin123!',
        tenant_slug: 'pasteleria-dulce-sabor'
    };

    beforeAll(async () => {
        // Get Tenant
        const [tenants] = await db.execute('SELECT * FROM tenants WHERE slug = ?', [testAdmin.tenant_slug]);
        if (tenants.length === 0) throw new Error('Tenant not found');
        tenantId = tenants[0].id_tenant;
        testClient.tenant_id = tenantId;

        // Register Client
        await request(app).post('/api/auth/register-public').send(testClient);

        // Login Client
        const clientLogin = await request(app).post('/api/auth/login').send({
            email: testClient.email,
            password: testClient.password,
            tenant_id: tenantId
        });
        clientToken = clientLogin.body.data.token;

        // Login Admin
        const adminLogin = await request(app).post('/api/auth/admin/login').send(testAdmin);
        adminToken = adminLogin.body.data.token;

        // Get Product with stock
        const [productos] = await db.execute('SELECT * FROM productos WHERE id_tenant = ? AND stock > 0 LIMIT 1', [tenantId]);
        if (productos.length === 0) throw new Error('No products found');
        productId = productos[0].id_producto;
    });

    afterAll(async () => {
        // Cleanup: Delete pedidos first (FK constraint), then usuario
        if (testClient.email) {
            const [usuarios] = await db.execute('SELECT id_usuario FROM usuarios WHERE email = ?', [testClient.email]);
            if (usuarios.length > 0) {
                const userId = usuarios[0].id_usuario;
                await db.execute('DELETE FROM pedidos WHERE id_usuario = ?', [userId]);
                await db.execute('DELETE FROM usuarios WHERE id_usuario = ?', [userId]);
            }
        }
    });

    it('should create a new order as client', async () => {
        const orderData = {
            items: [{
                id_producto: productId,
                cantidad: 1,
                precio_unitario: 1000,
                subtotal: 1000
            }],
            total: 1000,
            metodo_entrega: 'pickup',
            metodo_pago: 'efectivo',
            notas: 'Test order from Jest'
        };

        const res = await request(app)
            .post('/api/pedidos')
            .set('Authorization', `Bearer ${clientToken}`)
            .send(orderData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('numero_pedido');
    });

    it('should list orders for the client', async () => {
        const res = await request(app)
            .get('/api/pedidos')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should allow admin to view all orders', async () => {
        const res = await request(app)
            .get('/api/pedidos')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
