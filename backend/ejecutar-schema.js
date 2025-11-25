const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function ejecutarSchema() {
    let connection;
    
    try {
        // Conectar a la base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db',
            multipleStatements: true
        });

        console.log('✅ Conectado a MySQL');
        console.log(`📊 Base de datos: ${process.env.DB_NAME || 'smartpyme_db'}`);

        // Leer el archivo schema.sql
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📝 Ejecutando schema.sql...');
        
        // Ejecutar el schema
        await connection.query(schema);

        console.log('✅ Schema ejecutado correctamente');
        console.log('🎉 Tablas creadas exitosamente');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
}

// Ejecutar
ejecutarSchema()
    .then(() => {
        console.log('✨ Proceso finalizado');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
