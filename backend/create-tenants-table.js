const db = require('./config/db');

async function createTenantsTable() {
    console.log('🔧 Creando tabla tenants...\n');
    
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS tenants (
                id_tenant INT AUTO_INCREMENT PRIMARY KEY,
                nombre_empresa VARCHAR(200) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                email_empresa VARCHAR(100) NOT NULL,
                telefono_empresa VARCHAR(20),
                direccion_empresa TEXT,
                logo VARCHAR(500),
                plan VARCHAR(50) DEFAULT 'basico',
                activo BOOLEAN DEFAULT TRUE,
                fecha_inicio DATE NOT NULL DEFAULT (CURRENT_DATE),
                fecha_fin DATE,
                max_usuarios INT DEFAULT 5,
                max_productos INT DEFAULT 100,
                configuracion JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_slug (slug),
                INDEX idx_activo (activo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        console.log('✅ Tabla tenants creada exitosamente\n');
        
        //  Insertar tenant demo
        await db.execute(`
            INSERT INTO tenants (nombre_empresa, slug, email_empresa, plan, max_usuarios, max_productos)
            VALUES ('Empresa Demo', 'demo', 'admin@demo.com', 'profesional', 50, 1000)
        `);
        
        console.log('✅ Tenant "demo" creado\n');
        process.exit(0);
        
    } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('⚠️  La tabla tenants ya existe\n');
            process.exit(0);
        } else {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    }
}

createTenantsTable();
