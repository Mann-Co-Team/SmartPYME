const db = require('../config/db');
const bcrypt = require('bcrypt');

class ClienteModel {
    // Crear nuevo cliente
    static async create(clienteData) {
        try {
            const { nombre, apellido, email, password, telefono, direccion, id_tenant } = clienteData;
            
            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await db.execute(
                `INSERT INTO clientes (nombre, apellido, email, password, telefono, direccion, id_tenant, activo, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())`,
                [nombre, apellido, email, hashedPassword, telefono, direccion, id_tenant]
            );
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Obtener cliente por email (para login)
    static async getByEmail(email, tenantId = null) {
        try {
            let query = 'SELECT * FROM clientes WHERE email = ?';
            const params = [email];
            
            if (tenantId) {
                query += ' AND id_tenant = ?';
                params.push(tenantId);
            }
            
            const [clientes] = await db.execute(query, params);
            return clientes[0];
        } catch (error) {
            throw error;
        }
    }

    // Verificar si el email ya existe
    static async emailExists(email, tenantId = null) {
        try {
            let query = 'SELECT id_cliente FROM clientes WHERE email = ?';
            const params = [email];
            
            if (tenantId) {
                query += ' AND id_tenant = ?';
                params.push(tenantId);
            }
            
            const [clientes] = await db.execute(query, params);
            return clientes.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // Obtener cliente por ID
    static async getById(id, tenantId = null) {
        try {
            let query = 'SELECT id_cliente, nombre, apellido, email, telefono, direccion, activo, created_at FROM clientes WHERE id_cliente = ?';
            const params = [id];
            
            if (tenantId) {
                query += ' AND id_tenant = ?';
                params.push(tenantId);
            }
            
            const [clientes] = await db.execute(query, params);
            return clientes[0];
        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los clientes
    static async getAll(tenantId = null) {
        try {
            let query = 'SELECT id_cliente, nombre, apellido, email, telefono, direccion, activo, created_at FROM clientes';
            const params = [];
            
            if (tenantId) {
                query += ' WHERE id_tenant = ?';
                params.push(tenantId);
            }
            
            query += ' ORDER BY created_at DESC';
            
            const [clientes] = await db.execute(query, params);
            return clientes;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar cliente
    static async update(id, clienteData, tenantId = null) {
        try {
            const { nombre, apellido, email, telefono, direccion } = clienteData;
            
            let query = `UPDATE clientes 
                        SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ?
                        WHERE id_cliente = ?`;
            const params = [nombre, apellido, email, telefono, direccion, id];
            
            if (tenantId) {
                query += ' AND id_tenant = ?';
                params.push(tenantId);
            }
            
            const [result] = await db.execute(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Cambiar contraseña
    static async changePassword(id, newPassword, tenantId = null) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            let query = 'UPDATE clientes SET password = ? WHERE id_cliente = ?';
            const params = [hashedPassword, id];
            
            if (tenantId) {
                query += ' AND id_tenant = ?';
                params.push(tenantId);
            }
            
            const [result] = await db.execute(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Comparar contraseña
    static async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = ClienteModel;
