const db = require('../config/db');
const bcrypt = require('bcryptjs');

class UsuarioModel {
    // Obtener todos los usuarios
    static async getAll(tenantId = null) {
        try {
            if (tenantId) {
                const [rows] = await db.execute(`
                    SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, 
                           u.activo, u.created_at, u.id_rol, r.nombre_rol
                    FROM usuarios u
                    LEFT JOIN roles r ON u.id_rol = r.id_rol
                    WHERE u.id_tenant = ?
                    ORDER BY u.created_at DESC
                `, [tenantId]);
                return rows;
            }
            // Legacy mode
            const [rows] = await db.execute(`
                SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, 
                       u.activo, u.created_at, u.id_rol, r.nombre_rol
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id_rol
                ORDER BY u.created_at DESC
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por ID
    static async getById(id, tenantId = null) {
        try {
            let query = `
                SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, 
                       u.activo, u.id_rol, u.id_tenant, r.nombre_rol
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.id_usuario = ?`;
            const params = [id];
            
            if (tenantId) {
                query += ` AND u.id_tenant = ?`;
                params.push(tenantId);
            }
            
            const [rows] = await db.execute(query, params);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por email (incluye tenant para validación en login)
    static async getByEmail(email) {
        try {
            const [rows] = await db.execute(`
                SELECT u.*, r.nombre_rol
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.email = ?
            `, [email]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Crear nuevo usuario
    static async create(userData, tenantId = 1) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            const [result] = await db.execute(`
                INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, telefono)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                tenantId,
                userData.id_rol,
                userData.nombre,
                userData.apellido !== undefined ? userData.apellido : '',
                userData.email,
                hashedPassword,
                userData.telefono || null
            ]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar usuario
    static async update(id, userData, tenantId = null) {
        try {
            let query = `
                UPDATE usuarios 
                SET nombre = ?, apellido = ?, email = ?, telefono = ?, id_rol = ?
            `;
            let params = [
                userData.nombre,
                userData.apellido,
                userData.email,
                userData.telefono,
                userData.id_rol
            ];

            // Si se proporciona nueva contraseña
            if (userData.password) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                query += `, password = ?`;
                params.push(hashedPassword);
            }

            if (tenantId) {
                query += ` WHERE id_usuario = ? AND id_tenant = ?`;
                params.push(id, tenantId);
            } else {
                query += ` WHERE id_usuario = ?`;
                params.push(id);
            }

            const [result] = await db.execute(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Cambiar estado activo/inactivo
    static async toggleActive(id, tenantId = null) {
        try {
            const query = tenantId
                ? `UPDATE usuarios SET activo = NOT activo WHERE id_usuario = ? AND id_tenant = ?`
                : `UPDATE usuarios SET activo = NOT activo WHERE id_usuario = ?`;
            
            const params = tenantId ? [id, tenantId] : [id];
            const [result] = await db.execute(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar usuario
    static async delete(id, tenantId = null) {
        try {
            const query = tenantId
                ? `DELETE FROM usuarios WHERE id_usuario = ? AND id_tenant = ?`
                : `DELETE FROM usuarios WHERE id_usuario = ?`;
            
            const params = tenantId ? [id, tenantId] : [id];
            const [result] = await db.execute(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Obtener roles disponibles
    static async getRoles() {
        try {
            const [rows] = await db.execute(`
                SELECT id_rol, nombre_rol, descripcion 
                FROM roles 
                ORDER BY id_rol
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Contar usuarios activos por tenant (admin + empleados, excluyendo clientes)
    static async countActiveUsersByTenant(tenantId) {
        try {
            const [rows] = await db.execute(`
                SELECT COUNT(*) as total
                FROM usuarios
                WHERE id_tenant = ? 
                AND activo = 1
                AND id_rol IN (1, 2)
            `, [tenantId]);
            return rows[0].total;
        } catch (error) {
            throw error;
        }
    }

    // Obtener límite de usuarios del plan del tenant
    static async getTenantUserLimit(tenantId) {
        try {
            const [rows] = await db.execute(`
                SELECT plan, max_usuarios
                FROM tenants
                WHERE id_tenant = ? AND activo = 1
            `, [tenantId]);
            
            if (!rows[0]) return null;
            
            const { plan, max_usuarios } = rows[0];
            
            // Definir límites por plan (si max_usuarios no está configurado)
            const planLimits = {
                'basico': 2,
                'profesional': 5,
                'empresarial': null // ilimitado
            };
            
            return max_usuarios || planLimits[plan] || planLimits['basico'];
        } catch (error) {
            throw error;
        }
    }

    // Validar contraseña
    static async validatePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Obtener usuario por ID con contraseña (para cambio de contraseña)
    static async getByIdWithPassword(id) {
        try {
            const [rows] = await db.execute(`
                SELECT id_usuario, nombre, apellido, email, password
                FROM usuarios
                WHERE id_usuario = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Actualizar contraseña
    static async updatePassword(id, hashedPassword) {
        try {
            await db.execute(`
                UPDATE usuarios
                SET password = ?
                WHERE id_usuario = ?
            `, [hashedPassword, id]);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UsuarioModel;
