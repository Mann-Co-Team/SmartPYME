const db = require('./config/db');

async function addPasswordToClientes() {
    try {
        console.log('🔧 Agregando columna password a la tabla clientes...\n');

        // Verificar si la columna ya existe
        const [columns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'clientes' 
            AND COLUMN_NAME = 'password'
        `);

        if (columns.length > 0) {
            console.log('✅ La columna password ya existe en la tabla clientes');
            process.exit(0);
        }

        // Agregar columna password
        await db.execute(`
            ALTER TABLE clientes 
            ADD COLUMN password VARCHAR(255) NULL AFTER email
        `);

        console.log('✅ Columna password agregada exitosamente\n');
        console.log('📝 Nota: Los clientes existentes tendrán password NULL');
        console.log('   Deberán registrarse nuevamente o usar recuperación de contraseña\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addPasswordToClientes();
