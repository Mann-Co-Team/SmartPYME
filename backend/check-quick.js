const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smartpyme_db'
    });

    const [cols] = await conn.execute('DESCRIBE usuarios');
    const hasPhone = cols.some(c => c.Field === 'telefono');
    const hasAddress = cols.some(c => c.Field === 'direccion');

    const [stats] = await conn.execute(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN telefono IS NOT NULL AND telefono != '' THEN 1 ELSE 0 END) as con_telefono,
            SUM(CASE WHEN direccion IS NOT NULL AND direccion != '' THEN 1 ELSE 0 END) as con_direccion
        FROM usuarios 
        WHERE id_rol = 3
    `);

    const [orphans] = await conn.execute(`
        SELECT COUNT(*) as total 
        FROM usuarios 
        WHERE id_rol = 3 AND id_tenant IS NULL
    `);

    const [passwords] = await conn.execute(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN password IS NOT NULL AND password != '' AND LENGTH(password) > 20 THEN 1 ELSE 0 END) as con_hash
        FROM usuarios 
        WHERE id_rol = 3
    `);

    // Convertir a números para comparación
    const total = Number(stats[0].total);
    const conTelefono = Number(stats[0].con_telefono);
    const conDireccion = Number(stats[0].con_direccion);
    const huerfanos = Number(orphans[0].total);
    const totalClientes = Number(passwords[0].total);
    const conHash = Number(passwords[0].con_hash);

    const allOk = hasPhone && 
                  hasAddress && 
                  conTelefono === total && 
                  conDireccion === total && 
                  huerfanos === 0 && 
                  conHash === totalClientes;

    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log(allOk ? '✅ TODO CORRECTO!' : '⚠️  HAY PROBLEMAS');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('Campos (telefono, direccion):', hasPhone && hasAddress ? '✅' : '❌');
    console.log('Datos telefono:', conTelefono + '/' + total, conTelefono === total ? '✅' : '❌');
    console.log('Datos direccion:', conDireccion + '/' + total, conDireccion === total ? '✅' : '❌');
    console.log('Sin huerfanos (todos con tenant):', huerfanos === 0 ? '✅' : '❌ (' + huerfanos + ' huerfanos)');
    console.log('Passwords hasheados:', conHash + '/' + totalClientes, conHash === totalClientes ? '✅' : '❌');
    console.log('');

    await conn.end();
})();
