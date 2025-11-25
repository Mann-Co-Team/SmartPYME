const db = require('../config/db');

async function addSocialFieldsToTenants() {
    try {
        console.log('🔄 Iniciando migración: agregar campos de redes sociales a tenants...');

        // Verificar si la columna 'descripcion' ya existe
        const [descripcionExists] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'tenants' 
            AND COLUMN_NAME = 'descripcion'
        `);

        if (descripcionExists[0].count === 0) {
            console.log('  → Agregando columna descripcion...');
            await db.execute(`
                ALTER TABLE tenants 
                ADD COLUMN descripcion TEXT NULL AFTER direccion_empresa
            `);
            console.log('  ✅ Columna descripcion agregada');
        } else {
            console.log('  ℹ️ Columna descripcion ya existe');
        }

        // Verificar si la columna 'whatsapp' ya existe
        const [whatsappExists] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'tenants' 
            AND COLUMN_NAME = 'whatsapp'
        `);

        if (whatsappExists[0].count === 0) {
            console.log('  → Agregando columna whatsapp...');
            await db.execute(`
                ALTER TABLE tenants 
                ADD COLUMN whatsapp VARCHAR(20) NULL AFTER descripcion
            `);
            console.log('  ✅ Columna whatsapp agregada');
        } else {
            console.log('  ℹ️ Columna whatsapp ya existe');
        }

        // Verificar si la columna 'instagram' ya existe
        const [instagramExists] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'tenants' 
            AND COLUMN_NAME = 'instagram'
        `);

        if (instagramExists[0].count === 0) {
            console.log('  → Agregando columna instagram...');
            await db.execute(`
                ALTER TABLE tenants 
                ADD COLUMN instagram VARCHAR(100) NULL AFTER whatsapp
            `);
            console.log('  ✅ Columna instagram agregada');
        } else {
            console.log('  ℹ️ Columna instagram ya existe');
        }

        // Verificar si la columna 'facebook' ya existe
        const [facebookExists] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'tenants' 
            AND COLUMN_NAME = 'facebook'
        `);

        if (facebookExists[0].count === 0) {
            console.log('  → Agregando columna facebook...');
            await db.execute(`
                ALTER TABLE tenants 
                ADD COLUMN facebook VARCHAR(100) NULL AFTER instagram
            `);
            console.log('  ✅ Columna facebook agregada');
        } else {
            console.log('  ℹ️ Columna facebook ya existe');
        }

        console.log('✅ Migración completada exitosamente');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

// Ejecutar migración
addSocialFieldsToTenants();
