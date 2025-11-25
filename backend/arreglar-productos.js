const mysql = require('mysql2/promise');
require('dotenv').config();

async function arreglarProductos() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smartpyme_db'
    });

    console.log('✅ Conectado');

    // Eliminar constraint UNIQUE de nombre o codigo_barras si existe solo por ese campo
    console.log('📝 Verificando constraints en productos...');
    
    const [constraints] = await connection.execute(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'productos' 
        AND CONSTRAINT_TYPE = 'UNIQUE'
    `);

    console.log('Constraints encontrados:', constraints);

    // Verificar si existe constraint UNIQUE compuesto para código de barras
    const hasCodigoTenantUnique = constraints.some(c => 
        c.CONSTRAINT_NAME.includes('tenant') && c.CONSTRAINT_NAME.includes('codigo')
    );

    if (!hasCodigoTenantUnique) {
        // Verificar si hay unique solo en codigo_barras
        const [codigoConstraint] = await connection.execute(`
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'productos' 
            AND CONSTRAINT_NAME = 'codigo_barras'
        `);

        if (codigoConstraint.length > 0) {
            console.log('   Eliminando UNIQUE constraint en codigo_barras...');
            await connection.execute('ALTER TABLE productos DROP INDEX codigo_barras');
            console.log('✅ Constraint eliminado');
        }

        console.log('📝 Agregando UNIQUE constraint compuesto (id_tenant, codigo_barras)...');
        await connection.execute(`
            ALTER TABLE productos 
            ADD UNIQUE KEY unique_producto_codigo_tenant (id_tenant, codigo_barras)
        `);
        console.log('✅ Constraint agregado para codigo_barras');
    } else {
        console.log('✅ Ya existe constraint compuesto para codigo_barras');
    }

    console.log('🎉 Tabla productos corregida');

    await connection.end();
}

arreglarProductos().catch(console.error);
