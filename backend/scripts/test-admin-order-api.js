const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartpyme',
    port: process.env.DB_PORT || 3306
};

async function testAdminOrder() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // 1. Get Admin User (just to get tenant info)
        const [users] = await connection.execute('SELECT * FROM usuarios WHERE id_rol = 1 LIMIT 1');
        if (users.length === 0) throw new Error('No admin found');
        const admin = users[0];

        // 2. Get Tenant
        const [tenants] = await connection.execute('SELECT * FROM tenants WHERE id_tenant = ?', [admin.id_tenant]);
        const tenant = tenants[0];

        // 3. Get Product
        const [productos] = await connection.execute('SELECT * FROM productos WHERE id_tenant = ? AND stock > 0 LIMIT 1', [tenant.id_tenant]);
        const producto = productos[0];

        console.log(`Testing with Admin: ${admin.email}, Tenant: ${tenant.nombre_empresa}`);

        // 4. Create Temp Admin
        const tempEmail = `admin_test_${Date.now()}@test.com`;
        const tempPass = 'password123';

        console.log('Loading bcryptjs...');
        const bcrypt = require('bcryptjs');
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(tempPass, 10);

        console.log('Inserting temp admin...');
        await connection.execute(`
            INSERT INTO usuarios (id_tenant, nombre, apellido, email, password, id_rol, activo, created_at)
            VALUES (?, 'Admin', 'Test', ?, ?, 1, 1, NOW())
        `, [tenant.id_tenant, tempEmail, hashedPassword]);

        const [newUser] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', [tempEmail]);
        const adminUser = newUser[0];
        console.log(`Created temp admin: ${tempEmail}`);

        // 5. Login
        console.log('Attempting login...');
        const loginRes = await axios.post(`${API_URL}/auth/admin/login`, {
            email: tempEmail,
            password: tempPass,
            tenant_slug: tenant.slug
        });

        const token = loginRes.data.data.token; // Note: API returns data.token inside data object? Let's check auth controller.
        // AuthController: res.json({ success: true, data: { token, ... } })
        // So it is loginRes.data.data.token

        console.log('Login successful, token obtained');

        // 6. Create Order
        const orderData = {
            items: [{
                id_producto: producto.id_producto,
                cantidad: 1,
                precio_unitario: producto.precio,
                subtotal: producto.precio
            }],
            total: producto.precio,
            metodo_pago: 'efectivo',
            metodo_entrega: 'pickup',
            notas: 'Test order from admin via API'
        };

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        // Add x-tenant-id header just in case
        config.headers['x-tenant-id'] = tenant.id_tenant;

        console.log('Sending create order request...');
        const orderRes = await axios.post(`${API_URL}/pedidos`, orderData, config);

        console.log('✅ Order created successfully!');
        console.log('Order Number:', orderRes.data.data.numero_pedido); // Controller returns { success: true, data: { ... } } ?
        // PedidoController.create returns res.json({ success: true, data: pedidoCreado }) ?
        // No, let's check PedidoController.create response.
        // It returns: return res.status(201).json({ success: true, data: pedidoCreado }); (Usually)
        // Let's check the controller code again if needed.
        // Assuming standard response structure.

        // Cleanup
        await connection.execute('DELETE FROM usuarios WHERE id_usuario = ?', [adminUser.id_usuario]);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Status:', error.response.status);
        }
    } finally {
        if (connection) await connection.end();
    }
}

testAdminOrder();
