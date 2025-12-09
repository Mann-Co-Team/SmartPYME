const pool = require('../config/db');

async function fixAllAccents() {
    const connection = await pool.getConnection();

    try {
        console.log('Arreglando tildes...\n');

        // Función helper para reemplazar
        const fixText = (text) => {
            if (!text) return text;
            return text
                .replace(/Lim\?\?n/g, 'Limón')
                .replace(/T\?\?/g, 'Té')
                .replace(/Caf\?\?/g, 'Café')
                .replace(/Categor\?\?a/g, 'Categoría')
                .replace(/descripci\?\?n/g, 'descripción')
                .replace(/informaci\?\?n/g, 'información')
                .replace(/direcci\?\?n/g, 'dirección')
                .replace(/tel\?\?fono/g, 'teléfono')
                .replace(/\?\?/g, 'ó')
                .replace(/\?\?/g, 'á')
                .replace(/\?\?/g, 'é')
                .replace(/\?\?/g, 'í')
                .replace(/\?\?/g, 'ú')
                .replace(/\?\?/g, 'ñ');
        };

        // PRODUCTOS
        console.log('PRODUCTOS:');
        const [productos] = await connection.query(
            "SELECT id_producto, nombre, descripcion FROM productos WHERE nombre LIKE '%?%' OR descripcion LIKE '%?%'"
        );

        for (const p of productos) {
            await connection.query(
                'UPDATE productos SET nombre = ?, descripcion = ? WHERE id_producto = ?',
                [fixText(p.nombre), fixText(p.descripcion), p.id_producto]
            );
            console.log(`  OK: ${p.nombre}`);
        }

        // CATEGORÍAS
        console.log('\nCATEGORIAS:');
        const [categorias] = await connection.query(
            "SELECT id_categoria, nombre, descripcion FROM categorias WHERE nombre LIKE '%?%' OR descripcion LIKE '%?%'"
        );

        for (const c of categorias) {
            await connection.query(
                'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?',
                [fixText(c.nombre), fixText(c.descripcion), c.id_categoria]
            );
            console.log(`  OK: ${c.nombre}`);
        }

        // TENANTS
        console.log('\nTENANTS:');
        const [tenants] = await connection.query(
            "SELECT id_tenant, nombre_empresa, descripcion, direccion FROM tenants WHERE nombre_empresa LIKE '%?%' OR descripcion LIKE '%?%' OR direccion LIKE '%?%'"
        );

        for (const t of tenants) {
            await connection.query(
                'UPDATE tenants SET nombre_empresa = ?, descripcion = ?, direccion = ? WHERE id_tenant = ?',
                [fixText(t.nombre_empresa), fixText(t.descripcion), fixText(t.direccion), t.id_tenant]
            );
            console.log(`  OK: ${t.nombre_empresa}`);
        }

        // USUARIOS
        console.log('\nUSUARIOS:');
        const [usuarios] = await connection.query(
            "SELECT id_usuario, nombre FROM usuarios WHERE nombre LIKE '%?%'"
        );

        for (const u of usuarios) {
            await connection.query(
                'UPDATE usuarios SET nombre = ? WHERE id_usuario = ?',
                [fixText(u.nombre), u.id_usuario]
            );
            console.log(`  OK: ${u.nombre}`);
        }

        // CLIENTES
        console.log('\nCLIENTES:');
        const [clientes] = await connection.query(
            "SELECT id_cliente, nombre, direccion FROM clientes WHERE nombre LIKE '%?%' OR direccion LIKE '%?%'"
        );

        for (const c of clientes) {
            await connection.query(
                'UPDATE clientes SET nombre = ?, direccion = ? WHERE id_cliente = ?',
                [fixText(c.nombre), fixText(c.direccion), c.id_cliente]
            );
            console.log(`  OK: ${c.nombre}`);
        }

        console.log('\nLISTO!');

    } catch (error) {
        console.error('ERROR:', error.message);
    } finally {
        connection.release();
        process.exit(0);
    }
}

fixAllAccents();
