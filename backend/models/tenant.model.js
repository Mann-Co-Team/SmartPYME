const db = require('../config/db');

class TenantModel {
    /**
     * Obtener todos los tenants
     */
    static async getAll() {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    t.*,
                    (SELECT COUNT(*) FROM usuarios WHERE id_tenant = t.id_tenant AND activo = TRUE) as total_usuarios,
                    (SELECT COUNT(*) FROM productos WHERE id_tenant = t.id_tenant AND activo = TRUE) as total_productos
                FROM tenants t
                ORDER BY t.created_at DESC
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Buscar tenant por ID
     */
    static async getById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT * FROM tenants WHERE id_tenant = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Buscar tenant por slug
     */
    static async getBySlug(slug) {
        try {
            const [rows] = await db.execute(`
                SELECT * FROM tenants WHERE slug = ?
            `, [slug]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verificar si un tenant está activo
     */
    static async isActive(tenantId) {
        try {
            const [rows] = await db.execute(`
                SELECT activo FROM tenants 
                WHERE id_tenant = ?
            `, [tenantId]);
            
            if (!rows[0]) return false;
            return rows[0].activo === 1;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verificar límites del tenant
     */
    static async checkLimits(tenantId) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    t.id_tenant,
                    t.nombre_empresa,
                    t.plan,
                    COUNT(DISTINCT CASE WHEN u.id_rol IN (1, 2) THEN u.id_usuario END) as usuarios_actuales,
                    t.max_usuarios,
                    (COUNT(DISTINCT CASE WHEN u.id_rol IN (1, 2) THEN u.id_usuario END) >= t.max_usuarios) as limite_usuarios_alcanzado,
                    COUNT(DISTINCT p.id_producto) as productos_actuales,
                    t.max_productos,
                    (COUNT(DISTINCT p.id_producto) >= t.max_productos) as limite_productos_alcanzado,
                    COUNT(DISTINCT CASE WHEN u.id_rol = 3 THEN u.id_usuario END) as clientes_actuales
                FROM tenants t
                LEFT JOIN usuarios u ON t.id_tenant = u.id_tenant AND u.activo = TRUE
                LEFT JOIN productos p ON t.id_tenant = p.id_tenant AND p.activo = TRUE
                WHERE t.id_tenant = ?
                GROUP BY t.id_tenant
            `, [tenantId]);
            
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Crear nuevo tenant con admin inicial
     */
    static async create(tenantData, adminData) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Definir límites según plan
            let maxUsuarios = 5;
            let maxProductos = 100;
            
            switch (tenantData.plan) {
                case 'profesional':
                    maxUsuarios = 20;
                    maxProductos = 500;
                    break;
                case 'empresarial':
                    maxUsuarios = 100;
                    maxProductos = 5000;
                    break;
            }

            // Crear tenant
            const [tenantResult] = await connection.execute(`
                INSERT INTO tenants (
                    nombre_empresa, slug, email_empresa, telefono_empresa,
                    direccion_empresa, plan, max_usuarios, max_productos
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                tenantData.nombre_empresa,
                tenantData.slug,
                tenantData.email_empresa,
                tenantData.telefono_empresa || null,
                tenantData.direccion_empresa || null,
                tenantData.plan || 'basico',
                maxUsuarios,
                maxProductos
            ]);

            const tenantId = tenantResult.insertId;

            // Crear usuario administrador del tenant
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(adminData.password, 10);
            
            await connection.execute(`
                INSERT INTO usuarios (
                    id_tenant, id_rol, nombre, apellido, email, password, activo
                ) VALUES (?, 1, ?, ?, ?, ?, TRUE)
            `, [
                tenantId,
                adminData.nombre,
                adminData.apellido,
                adminData.email,
                hashedPassword
            ]);

            // Crear categoría por defecto
            await connection.execute(`
                INSERT INTO categorias (id_tenant, nombre, descripcion, activo)
                VALUES (?, 'General', 'Categoría general para productos', TRUE)
            `, [tenantId]);

            // Crear configuraciones por defecto
            const defaultSettings = [
                ['company_name', tenantData.nombre_empresa, 'Nombre de la empresa'],
                ['theme_color', '#007bff', 'Color principal del tema'],
                ['company_email', tenantData.email_empresa, 'Email de la empresa'],
                ['company_phone', tenantData.telefono_empresa || '', 'Teléfono de la empresa'],
                ['company_address', tenantData.direccion_empresa || '', 'Dirección de la empresa'],
                ['delivery_enabled', 'true', 'Habilitar delivery'],
                ['pickup_enabled', 'true', 'Habilitar retiro en tienda'],
                ['min_order_amount', '0', 'Monto mínimo de pedido']
            ];

            for (const [key, value, description] of defaultSettings) {
                await connection.execute(`
                    INSERT INTO settings (id_tenant, setting_key, setting_value, description)
                    VALUES (?, ?, ?, ?)
                `, [tenantId, key, value, description]);
            }

            await connection.commit();
            return tenantId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Actualizar tenant
     */
    static async update(id, tenantData) {
        try {
            const [result] = await db.execute(`
                UPDATE tenants 
                SET nombre_empresa = ?,
                    email_empresa = ?,
                    telefono_empresa = ?,
                    direccion_empresa = ?,
                    descripcion = ?,
                    whatsapp = ?,
                    instagram = ?,
                    facebook = ?,
                    logo = ?,
                    plan = ?
                WHERE id_tenant = ?
            `, [
                tenantData.nombre_empresa,
                tenantData.email_empresa,
                tenantData.telefono_empresa || null,
                tenantData.direccion_empresa || null,
                tenantData.descripcion || null,
                tenantData.whatsapp || null,
                tenantData.instagram || null,
                tenantData.facebook || null,
                tenantData.logo || null,
                tenantData.plan,
                id
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Activar/Desactivar tenant
     */
    static async toggleActive(id) {
        try {
            const [result] = await db.execute(`
                UPDATE tenants 
                SET activo = NOT activo 
                WHERE id_tenant = ?
            `, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener estadísticas del tenant
     */
    static async getStats(tenantId) {
        try {
            const [rows] = await db.execute(`
                SELECT * FROM v_tenant_stats WHERE id_tenant = ?
            `, [tenantId]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Registrar actividad en el log de auditoría
     */
    static async logActivity(tenantId, accion, tabla, idRegistro, idUsuario, detalles = null) {
        try {
            await db.execute(`
                INSERT INTO tenant_audit_log (
                    id_tenant, accion, tabla_afectada, id_registro, id_usuario, detalles
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                tenantId,
                accion,
                tabla,
                idRegistro,
                idUsuario,
                detalles ? JSON.stringify(detalles) : null
            ]);
        } catch (error) {
            console.error('Error registrando actividad:', error);
        }
    }

    /**
     * Obtener log de actividades del tenant
     */
    static async getActivityLog(tenantId, limit = 50) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    l.*,
                    u.nombre as usuario_nombre,
                    u.email as usuario_email
                FROM tenant_audit_log l
                LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
                WHERE l.id_tenant = ?
                ORDER BY l.created_at DESC
                LIMIT ?
            `, [tenantId, limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verificar si el slug está disponible
     */
    static async isSlugAvailable(slug) {
        try {
            const [rows] = await db.execute(`
                SELECT COUNT(*) as count FROM tenants WHERE slug = ?
            `, [slug]);
            return rows[0].count === 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = TenantModel;
