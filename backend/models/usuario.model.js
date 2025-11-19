const db = require('../config/db');
const bcrypt = require('bcryptjs');

class UsuarioModel {
    // Obtener todos los usuarios
    static async getAll() {
        try {
            const [rows] = await db.execute(`
                SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, 
                       u.activo, u.created_at, r.nombre_rol
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
    static async getById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, 
                       u.activo, u.id_rol, r.nombre_rol
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.id_usuario = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por email
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
    static async create(userData) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            const [result] = await db.execute(`
                INSERT INTO usuarios (id_rol, nombre, apellido, email, password, telefono)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
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
    static async update(id, userData) {
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

            query += ` WHERE id_usuario = ?`;
            params.push(id);

            const [result] = await db.execute(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Cambiar estado activo/inactivo
    static async toggleActive(id) {
        try {
            const [result] = await db.execute(`
                UPDATE usuarios 
                SET activo = NOT activo 
                WHERE id_usuario = ?
            `, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar usuario
    static async delete(id) {
        try {
            const [result] = await db.execute(`
                DELETE FROM usuarios WHERE id_usuario = ?
            `, [id]);
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

    // Validar contraseña
    static async validatePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = UsuarioModel;
