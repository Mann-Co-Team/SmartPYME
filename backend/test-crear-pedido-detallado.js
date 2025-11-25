const axios = require('axios');

(async () => {
    try {
        // Login
        console.log('🔐 Haciendo login...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'cliente1@pasteleria-dulce-sabor.com',
            password: 'Cliente123!',
            tenant_id: 18
        });
        
        const token = loginRes.data.data.token;
        console.log('✅ Token obtenido\n');
        
        // Obtener productos del catálogo
        console.log('📦 Obteniendo productos del catálogo...');
        const catalogoRes = await axios.get('http://localhost:3000/api/catalogo/pasteleria-dulce-sabor/productos');
        const productos = catalogoRes.data.data.filter(p => p.stock > 0);
        
        console.log(`✅ ${productos.length} productos con stock`);
        const producto = productos[0];
        console.log(`\n📋 Producto seleccionado:`);
        console.log(`   ID: ${producto.id_producto}`);
        console.log(`   Nombre: ${producto.nombre}`);
        console.log(`   Precio: ${producto.precio}`);
        console.log(`   Stock: ${producto.stock}`);
        
        // Crear pedido
        console.log('\n📦 Creando pedido...');
        const pedidoData = {
            items: [{
                id_producto: producto.id_producto,
                cantidad: 1,
                precio_unitario: producto.precio,
                subtotal: producto.precio
            }],
            total: producto.precio,
            metodo_entrega: 'pickup',
            metodo_pago: 'efectivo',
            notas: 'Pedido de prueba RF-3'
        };
        
        console.log('\n📝 Datos del pedido:');
        console.log(JSON.stringify(pedidoData, null, 2));
        
        const pedidoRes = await axios.post('http://localhost:3000/api/pedidos', pedidoData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('\n✅ Pedido creado exitosamente!');
        console.log(JSON.stringify(pedidoRes.data, null, 2));
        
    } catch (error) {
        console.error('\n❌ Error detallado:');
        console.error('Mensaje:', error.message);
        console.error('Código:', error.code);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
    }
})();
