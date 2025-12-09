// Modelo de Configuraciones del Sistema
const db = require('../config/db');

class SystemSettings {
    /**
     * Obtener todas las configuraciones de un tenant
     */
    static async getAll(tenantId) {
        const [rows] = await db.execute(
            `SELECT 
                setting_key,
                setting_value,
                setting_type,
                category,
                description,
                is_public,
                updated_at
            FROM system_settings
            WHERE id_tenant = ?
            ORDER BY category, setting_key`,
            [tenantId]
        );

        // Convertir valores según su tipo
        return rows.map(row => ({
            ...row,
            setting_value: this.parseValue(row.setting_value, row.setting_type)
        }));
    }

    /**
     * Obtener configuraciones públicas (para usuarios no admin)
     */
    static async getPublic(tenantId) {
        const [rows] = await db.execute(
            `SELECT 
                setting_key,
                setting_value,
                setting_type,
                category,
                description
            FROM system_settings
            WHERE id_tenant = ? AND is_public = TRUE
            ORDER BY category, setting_key`,
            [tenantId]
        );

        return rows.map(row => ({
            ...row,
            setting_value: this.parseValue(row.setting_value, row.setting_type)
        }));
    }

    /**
     * Obtener configuraciones públicas sin tenant (para páginas públicas)
     */
    static async getPublicSettings() {
        const [rows] = await db.execute(
            `SELECT 
                id_tenant,
                setting_key,
                setting_value,
                setting_type
            FROM system_settings
            WHERE is_public = TRUE AND setting_key IN ('currency', 'language', 'tax_rate')
            ORDER BY id_tenant, setting_key`
        );

        // Agrupar por tenant
        const settingsByTenant = {};
        rows.forEach(row => {
            if (!settingsByTenant[row.id_tenant]) {
                settingsByTenant[row.id_tenant] = [];
            }
            settingsByTenant[row.id_tenant].push({
                key: row.setting_key,
                value: this.parseValue(row.setting_value, row.setting_type),
                type: row.setting_type
            });
        });

        return settingsByTenant;
    }

    /**
     * Obtener configuración por clave
     */
    static async getByKey(tenantId, key) {
        const [rows] = await db.execute(
            `SELECT 
                setting_key,
                setting_value,
                setting_type,
                category,
                description,
                is_public
            FROM system_settings
            WHERE id_tenant = ? AND setting_key = ?`,
            [tenantId, key]
        );

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            ...row,
            setting_value: this.parseValue(row.setting_value, row.setting_type)
        };
    }

    /**
     * Obtener configuraciones por categoría
     */
    static async getByCategory(tenantId, category) {
        const [rows] = await db.execute(
            `SELECT 
                setting_key,
                setting_value,
                setting_type,
                category,
                description,
                is_public
            FROM system_settings
            WHERE id_tenant = ? AND category = ?
            ORDER BY setting_key`,
            [tenantId, category]
        );

        return rows.map(row => ({
            ...row,
            setting_value: this.parseValue(row.setting_value, row.setting_type)
        }));
    }

    /**
     * Actualizar configuración
     */
    static async update(tenantId, key, value, userId) {
        // Obtener tipo de la configuración
        const existing = await this.getByKey(tenantId, key);
        if (!existing) {
            throw new Error(`Configuración '${key}' no encontrada`);
        }

        // Convertir valor al formato de almacenamiento
        const storedValue = this.stringifyValue(value, existing.setting_type);

        const [result] = await db.execute(
            `UPDATE system_settings
            SET setting_value = ?, updated_by = ?, updated_at = NOW()
            WHERE id_tenant = ? AND setting_key = ?`,
            [storedValue, userId, tenantId, key]
        );

        return result.affectedRows > 0;
    }

    /**
     * Actualizar múltiples configuraciones
     */
    static async updateMultiple(tenantId, settings, userId) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            console.log('[SystemSettings] Updating settings:', settings);

            for (const [key, value] of Object.entries(settings)) {
                console.log(`[SystemSettings] Processing key: ${key}, value:`, value);
                const existing = await this.getByKey(tenantId, key);
                console.log(`[SystemSettings] Existing setting for ${key}:`, existing);

                if (existing) {
                    const storedValue = this.stringifyValue(value, existing.setting_type);
                    console.log(`[SystemSettings] Storing ${key} = ${storedValue}`);

                    const [result] = await connection.execute(
                        `UPDATE system_settings
                        SET setting_value = ?, updated_by = ?, updated_at = NOW()
                        WHERE id_tenant = ? AND setting_key = ?`,
                        [storedValue, userId, tenantId, key]
                    );
                    console.log(`[SystemSettings] Updated ${key}, affected rows:`, result.affectedRows);
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Crear configuración
     */
    static async create(tenantId, key, value, type, category, description, isPublic, userId) {
        const storedValue = this.stringifyValue(value, type);

        const [result] = await db.execute(
            `INSERT INTO system_settings 
            (id_tenant, setting_key, setting_value, setting_type, category, description, is_public, updated_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [tenantId, key, storedValue, type, category, description, isPublic, userId]
        );

        return result.insertId;
    }

    /**
     * Inicializar configuraciones por defecto para un nuevo tenant
     */
    static async initializeDefaults(tenantId, notificationEmail) {
        const defaults = [
            { key: 'currency', value: 'CLP', type: 'string', category: 'regional', description: 'Moneda del sistema', isPublic: true },
            { key: 'language', value: 'es', type: 'string', category: 'regional', description: 'Idioma del sistema', isPublic: true },
            { key: 'timezone', value: 'America/Santiago', type: 'string', category: 'regional', description: 'Zona horaria', isPublic: true },
            { key: 'notification_email', value: notificationEmail, type: 'string', category: 'notifications', description: 'Email para notificaciones', isPublic: false },
            { key: 'tax_rate', value: '19', type: 'number', category: 'regional', description: 'Tasa de impuesto (IVA %)', isPublic: true },
            {
                key: 'email_template_order',
                value: JSON.stringify({
                    subject: 'Nuevo Pedido #{{order_id}}',
                    body: 'Estimado {{customer_name}},\n\nSu pedido #{{order_id}} ha sido recibido.\n\nTotal: {{total}}\n\nGracias por su compra.'
                }),
                type: 'json',
                category: 'templates',
                description: 'Plantilla de email para pedidos',
                isPublic: false
            },
            {
                key: 'pdf_template_invoice',
                value: JSON.stringify({
                    header: '{{company_name}}',
                    footer: 'Gracias por su compra',
                    show_logo: true
                }),
                type: 'json',
                category: 'templates',
                description: 'Plantilla de PDF para facturas',
                isPublic: false
            }
        ];

        for (const setting of defaults) {
            await this.create(
                tenantId,
                setting.key,
                setting.value,
                setting.type,
                setting.category,
                setting.description,
                setting.isPublic,
                null
            );
        }
    }

    /**
     * Parsear valor según tipo
     */
    static parseValue(value, type) {
        if (value === null) return null;

        switch (type) {
            case 'number':
                return parseFloat(value);
            case 'boolean':
                return value === 'true' || value === '1' || value === 1;
            case 'json':
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            default:
                return value;
        }
    }

    /**
     * Convertir valor a string para almacenamiento
     */
    static stringifyValue(value, type) {
        if (value === null || value === undefined) return null;

        switch (type) {
            case 'json':
                return typeof value === 'string' ? value : JSON.stringify(value);
            case 'boolean':
                return value ? '1' : '0';
            default:
                return String(value);
        }
    }
}

module.exports = SystemSettings;
