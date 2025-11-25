const ClienteModel = require('../models/cliente.model');
const { validationResult } = require('express-validator');

class ClienteController {
    // Crear nuevo cliente (registro público)
    static async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { nombre, apellido, email, password, telefono, direccion, id_tenant } = req.body;

            // Verificar que el tenant existe
            if (!id_tenant) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar una tienda'
                });
            }

            // Verificar si el email ya existe para este tenant
            const emailExists = await ClienteModel.emailExists(email, id_tenant);
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Este email ya está registrado en esta tienda'
                });
            }

            // Crear el cliente
            const clienteId = await ClienteModel.create({
                nombre,
                apellido,
                email,
                password,
                telefono,
                direccion,
                id_tenant
            });

            res.status(201).json({
                success: true,
                message: 'Cliente creado exitosamente',
                data: { id_cliente: clienteId }
            });
        } catch (error) {
            console.error('Error al crear cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el cliente'
            });
        }
    }

    // Obtener todos los clientes (solo para admin)
    static async getAll(req, res) {
        try {
            const tenantId = req.user?.id_tenant || null;
            const clientes = await ClienteModel.getAll(tenantId);

            res.json({
                success: true,
                data: clientes
            });
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los clientes'
            });
        }
    }

    // Obtener cliente por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.id_tenant || null;
            
            const cliente = await ClienteModel.getById(id, tenantId);

            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }

            res.json({
                success: true,
                data: cliente
            });
        } catch (error) {
            console.error('Error al obtener cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el cliente'
            });
        }
    }

    // Actualizar cliente
    static async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const tenantId = req.user?.id_tenant || null;
            const { nombre, apellido, email, telefono, direccion } = req.body;

            const updated = await ClienteModel.update(id, {
                nombre,
                apellido,
                email,
                telefono,
                direccion
            }, tenantId);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Cliente actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el cliente'
            });
        }
    }

    // Login de cliente
    static async login(req, res) {
        try {
            const { email, password, id_tenant } = req.body;

            if (!email || !password || !id_tenant) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, contraseña y tienda son requeridos'
                });
            }

            // Buscar cliente por email y tenant
            const cliente = await ClienteModel.getByEmail(email, id_tenant);

            if (!cliente) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            if (!cliente.activo) {
                return res.status(401).json({
                    success: false,
                    message: 'Tu cuenta está desactivada'
                });
            }

            // Verificar contraseña
            const passwordMatch = await ClienteModel.comparePassword(password, cliente.password);

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token JWT
            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                {
                    id_cliente: cliente.id_cliente,
                    email: cliente.email,
                    id_tenant: cliente.id_tenant,
                    tipo: 'cliente'
                },
                process.env.JWT_SECRET || 'secret_key_default',
                { expiresIn: '7d' }
            );

            // Remover password de la respuesta
            delete cliente.password;

            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    token,
                    cliente
                }
            });
        } catch (error) {
            console.error('Error en login de cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al iniciar sesión'
            });
        }
    }
}

module.exports = ClienteController;
