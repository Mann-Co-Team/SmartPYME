const mysql = require('mysql2/promise');

async function testPedido() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '1234',
        database: 'smartpyme_db'
    });

    try {
        console.log('=== VERIFICANDO TABLA CLIENTES ===');
        const [clientes] = await connection.execute('SELECT * FROM clientes LIMIT 5');
        console.log('Clientes en BD:', clientes.length);
        console.log(JSON.stringify(clientes, null, 2));

        console.log('\n=== VERIFICANDO USUARIO ===');
        const [usuarios] = await connection.execute('SELECT id_usuario, nombre, apellido, email, telefono FROM usuarios WHERE email = ?', ['juan.perez@ejemplo.com']);
        console.log('Usuario encontrado:', usuarios.length > 0 ? 'SÍ' : 'NO');
        if (usuarios.length > 0) {
            console.log(JSON.stringify(usuarios[0], null, 2));
        }

        console.log('\n=== VERIFICANDO PRODUCTOS ===');
        const [productos] = await connection.execute('SELECT id_producto, nombre, stock, precio FROM productos WHERE id_producto = 1');
        console.log('Producto ID 1:', productos.length > 0 ? 'SÍ' : 'NO');
        if (productos.length > 0) {
            console.log(JSON.stringify(productos[0], null, 2));
        }

        console.log('\n=== PROBANDO CREAR CLIENTE DESDE USUARIO ===');
        const usuario = usuarios[0];
        
        // Buscar si ya existe un cliente para este usuario
        const [clienteExistente] = await connection.execute(
            'SELECT id_cliente FROM clientes WHERE email = ?',
            [usuario.email]
        );
        
        if (clienteExistente.length > 0) {
            console.log('✓ Cliente ya existe:', clienteExistente[0].id_cliente);
        } else {
            console.log('× Cliente no existe, se debe crear');
            const [result] = await connection.execute(
                'INSERT INTO clientes (nombre, apellido, email, telefono) VALUES (?, ?, ?, ?)',
                [usuario.nombre, usuario.apellido || '', usuario.email, usuario.telefono]
            );
            console.log('✓ Cliente creado con ID:', result.insertId);
        }

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await connection.end();
    }
}

testPedido();
