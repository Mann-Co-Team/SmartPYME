// Test simple para crear pedido
const axios = require('axios');

async function test() {
    try {
        // Login
        console.log('1. Login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'juan.perez@ejemplo.com',
            password: 'prueba123'
        });
        
        const token = loginResponse.data.data.token;
        const usuarioId = loginResponse.data.data.user.id;
        console.log('✓ Token obtenido, Usuario ID:', usuarioId);
        
        // Obtener productos
        console.log('\n2. Obteniendo productos...');
        const productosResponse = await axios.get('http://localhost:5000/api/productos');
        const producto = productosResponse.data.data.find(p => p.stock > 0);
        console.log('✓ Producto encontrado:', producto.id_producto, producto.nombre, 'Stock:', producto.stock);
        
        // Crear pedido
        console.log('\n3. Creando pedido...');
        const pedidoData = {
            id_usuario_cliente: usuarioId,
            items: [{
                id_producto: producto.id_producto,
                cantidad: 1,
                precio_unitario: producto.precio,
                subtotal: producto.precio
            }],
            total: producto.precio,
            metodo_pago: 'efectivo',
            notas: 'Test desde Node.js',
            direccion_entrega: 'Test 123',
            metodo_entrega: 'delivery'
        };
        
        console.log('Datos del pedido:', JSON.stringify(pedidoData, null, 2));
        
        const pedidoResponse = await axios.post('http://localhost:5000/api/pedidos', pedidoData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✓ Pedido creado:', pedidoResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
}

test();
