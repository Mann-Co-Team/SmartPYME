const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Ejecutando migration: add-historial-estados...\n');
        
        // Leer el archivo SQL
        const sqlFile = path.join(__dirname, '..', 'database', 'migrations', 'add-historial-estados.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        // Separar por declaración SQL (split por ;)
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (let statement of statements) {
            if (statement.trim()) {
                try {
                    await db.execute(statement);
                    console.log('✓ Sentencia ejecutada correctamente');
                } catch (err) {
                    if (err.code === 'ER_TABLE_EXISTS_ALREADY') {
                        console.log('✓ Tabla historial_estados_pedido ya existe');
                    } else if (err.code === 'ER_DUP_KEYNAME') {
                        console.log('✓ Índice ya existe');
                    } else if (err.message.includes('Duplicate entry')) {
                        console.log('✓ Registros de historial ya existen');
                    } else {
                        console.error('Error en sentencia:', statement.substring(0, 100));
                        throw err;
                    }
                }
            }
        }
        
        // Verificar que la tabla se creó
        const [tables] = await db.execute(`
            SHOW TABLES LIKE 'historial_estados_pedido'
        `);
        
        if (tables.length > 0) {
            console.log('✅ Tabla historial_estados_pedido creada/verificada');
            
            // Mostrar conteo de registros
            const [count] = await db.execute(`
                SELECT COUNT(*) as total FROM historial_estados_pedido
            `);
            console.log(`✅ Registros en historial: ${count[0].total}`);
        }
        
        // Verificar estados disponibles
        const [estados] = await db.execute('SELECT * FROM estados_pedido');
        console.log('\n📋 Estados disponibles:');
        estados.forEach(estado => {
            console.log(`   ${estado.id_estado}. ${estado.nombre_estado}`);
        });
        
        console.log('\n✅ Migration completada exitosamente\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando migration:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
