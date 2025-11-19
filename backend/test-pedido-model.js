require('dotenv').config();
const PedidoModel = require('./models/pedido.model');

async function testModel() {
    try {
        console.log('Probando PedidoModel.getAll()...');
        const pedidos = await PedidoModel.getAll();
        console.log(`✅ getAll() funciona: ${pedidos.length} pedidos`);
        if (pedidos.length > 0) {
            console.log('Primer pedido:', pedidos[0]);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
    process.exit(0);
}

testModel();
