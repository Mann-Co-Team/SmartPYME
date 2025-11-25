const mysql = require('mysql2/promise');
require('dotenv').config();

async function arreglarCategorias() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smartpyme_db'
    });

    console.log('✅ Conectado');

    // Eliminar constraint UNIQUE de nombre si existe
    console.log('📝 Verificando constraints en categorias...');
    
    const [constraints] = await connection.execute(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'categorias' 
        AND CONSTRAINT_NAME = 'nombre'
    `);

    if (constraints.length > 0) {
        console.log('   Eliminando UNIQUE constraint en nombre...');
        await connection.execute('ALTER TABLE categorias DROP INDEX nombre');
        console.log('✅ Constraint eliminado');
    } else {
        console.log('✅ No hay constraint UNIQUE en nombre');
    }

    // Verificar si existe constraint UNIQUE compuesto (id_tenant, nombre)
    const [uniqueConstraints] = await connection.execute(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'categorias' 
        AND CONSTRAINT_TYPE = 'UNIQUE'
    `);

    const hasCompositeUnique = uniqueConstraints.some(c => 
        c.CONSTRAINT_NAME.includes('tenant') || c.CONSTRAINT_NAME.includes('unique_categoria_tenant')
    );

    if (!hasCompositeUnique) {
        console.log('📝 Agregando UNIQUE constraint compuesto (id_tenant, nombre)...');
        await connection.execute(`
            ALTER TABLE categorias 
            ADD UNIQUE KEY unique_categoria_tenant (id_tenant, nombre)
        `);
        console.log('✅ Constraint agregado');
    } else {
        console.log('✅ Ya existe constraint compuesto');
    }

    console.log('🎉 Tabla categorias corregida');

    await connection.end();
}

arreglarCategorias().catch(console.error);
