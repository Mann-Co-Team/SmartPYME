const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuario.model');

class AuthController {
    // Login de usuario
    static async login(req, res) {
    console.log('BODY RECIBIDO:', req.body);
        try {
            const { email, password } = req.body;

            // Validar datos requeridos
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }

            // Buscar usuario
            const user = await UsuarioModel.getByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar si el usuario está activo
            if (!user.activo) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario desactivado'
                });
            }

            // Validar contraseña
            const isValidPassword = await UsuarioModel.validatePassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                { 
                    userId: user.id_usuario,
                    email: user.email,
                    role: user.id_rol
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Respuesta exitosa
            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    token,
                    user: {
                        id: user.id_usuario,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        email: user.email,
                        rol: user.nombre_rol,
                        id_rol: user.id_rol
                    }
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Registro público de clientes
    static async registerPublic(req, res) {
        console.log('📝 Registro público - Body recibido:', req.body);
        try {
            const { nombre, email, password, telefono } = req.body;

            // Validar datos requeridos
            if (!nombre || !email || !password) {
                console.log('❌ Faltan campos obligatorios');
                return res.status(400).json({
                    success: false,
                    message: 'Nombre, email y contraseña son obligatorios'
                });
            }

            // Verificar si el email ya existe
            console.log('🔍 Verificando email:', email);
            const existingUser = await UsuarioModel.getByEmail(email);
            if (existingUser) {
                console.log('❌ Email ya existe');
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            // Crear usuario con rol de cliente (id_rol = 3)
            console.log('✅ Creando usuario con rol cliente...');
            const userId = await UsuarioModel.create({
                nombre,
                apellido: '',
                email,
                password,
                telefono: telefono || null,
                id_rol: 3 // Cliente
            });

            console.log('✅ Usuario creado exitosamente con ID:', userId);
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: { id: userId }
            });

        } catch (error) {
            console.error('❌ Error en registro público:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar usuario: ' + error.message
            });
        }
    }

    // Registro de nuevo usuario (solo admin)
    static async register(req, res) {
        try {
            const { nombre, apellido, email, password, telefono, id_rol } = req.body;

            // Validar datos requeridos
            if (!nombre || !apellido || !email || !password || !id_rol) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos obligatorios deben ser completados'
                });
            }

            // Verificar si el email ya existe
            const existingUser = await UsuarioModel.getByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            // Crear usuario
            const userId = await UsuarioModel.create({
                nombre,
                apellido,
                email,
                password,
                telefono,
                id_rol
            });

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: { id: userId }
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Verificar token
    static async verifyToken(req, res) {
        try {
            // El middleware ya validó el token, solo devolvemos la info del usuario
            const user = await UsuarioModel.getById(req.user.id_usuario);
            
            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id_usuario,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        email: user.email,
                        rol: user.nombre_rol,
                        id_rol: user.id_rol
                    }
                }
            });
        } catch (error) {
            console.error('Error verificando token:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = AuthController;
