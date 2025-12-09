const pool = require('../config/db');

async function checkCurrency() {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(
            "SELECT id_tenant, setting_key, setting_value FROM system_settings WHERE setting_key = 'currency'"
        );

        console.log('Currency settings in database:');
        console.table(rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        connection.release();
        process.exit(0);
    }
}

checkCurrency();
