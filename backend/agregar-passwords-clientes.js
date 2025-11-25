const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function agregarPasswordsClientes() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Paso 1: Agregar columna password si no existe
        console.log('📝 Paso 1: Agregando columna password a tabla clientes...');
        try {
            await connection.execute(`
                ALTER TABLE clientes 
                ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''
                AFTER email
            `);
            console.log('✅ Columna password agregada\n');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️  Columna password ya existe\n');
            } else {
                throw error;
            }
        }

        // Paso 2: Hashear password123 para todos los clientes
        console.log('📝 Paso 2: Hasheando contraseñas...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        console.log(`✅ Password hasheado: ${hashedPassword.substring(0, 30)}...\n`);

        // Paso 3: Actualizar todos los clientes con el password hasheado
        console.log('📝 Paso 3: Actualizando passwords de todos los clientes...');
        const [result] = await connection.execute(`
            UPDATE clientes 
            SET password = ?
            WHERE password IS NULL OR password = ''
        `, [hashedPassword]);

        console.log(`✅ ${result.affectedRows} clientes actualizados\n`);

        // Paso 4: Verificar
        console.log('📝 Paso 4: Verificando...');
        const [clientes] = await connection.execute(`
            SELECT id_cliente, nombre, email, 
                   CASE 
                       WHEN password IS NULL THEN '❌ NULL'
                       WHEN password = '' THEN '❌ VACÍO'
                       WHEN LENGTH(password) < 20 THEN '❌ NO HASHEADO'
                       ELSE '✅ OK'
                   END as estado
            FROM clientes
            LIMIT 5
        `);

        console.log('\n📊 MUESTRA DE CLIENTES:');
        clientes.forEach(c => {
            console.log(`   ${c.estado} ${c.nombre} (${c.email})`);
        });

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('🎉 ¡COMPLETADO EXITOSAMENTE!');
        console.log('');
        console.log('💡 AHORA PUEDES:');
        console.log('   1. Iniciar sesión con cualquier cliente');
        console.log('   2. Usar la contraseña: password123');
        console.log('   3. Ejemplo: cliente1@pasteleria-dulce-sabor.com / password123\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

agregarPasswordsClientes();
