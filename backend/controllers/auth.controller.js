const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuario.model');

class AuthController {
    // Login público para clientes (requiere tenant_id para aislamiento)
    static async loginPublic(req, res) {
        console.log('LOGIN PÚBLICO - BODY RECIBIDO:', req.body);
        try {
            const { email, password, tenant_id } = req.body;

            // Validar datos requeridos
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }

            // VALIDACIÓN CRÍTICA: tenant_id es OBLIGATORIO para aislamiento
            if (!tenant_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar la tienda para iniciar sesión'
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

            // Verificar que sea un cliente (rol 3)
            if (user.id_rol !== 3) {
                return res.status(401).json({
                    success: false,
                    message: 'Por favor use el login de administración'
                });
            }

            // VALIDACIÓN CRÍTICA: El usuario DEBE pertenecer al tenant desde el cual intenta loguearse
            if (user.id_tenant !== parseInt(tenant_id)) {
                return res.status(401).json({
                    success: false,
                    message: 'No tienes acceso a esta tienda. Este correo pertenece a otra tienda.'
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

            // Generar token JWT (incluye tenant_id si el usuario lo tiene)
            const tokenData = {
                userId: user.id_usuario,
                email: user.email,
                role: user.id_rol
            };

            if (user.id_tenant) {
                tokenData.tenant_id = user.id_tenant;
            }

            const token = jwt.sign(
                tokenData,
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Respuesta exitosa (incluye telefono y direccion para clientes)
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
                        id_rol: user.id_rol,
                        telefono: user.telefono || null,
                        direccion: user.direccion || null
                    }
                }
            });

        } catch (error) {
            console.error('Error en login público:', error);
            res.status(500).json({
                success: false,
                message: 'Error de conexión. Intente nuevamente más tarde'
            });
        }
    }

    // Login de admin/empleados con soporte multitenant
    static async loginAdmin(req, res) {
        console.log('LOGIN ADMIN - BODY RECIBIDO:', req.body);
        try {
            const { email, password, tenant_slug } = req.body;

            // Validar datos requeridos
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }

            // Si se proporciona tenant_slug, validarlo primero
            if (!tenant_slug) {
                return res.status(401).json({
                    success: false,
                    message: 'No autorizado: Falta identificador de empresa (tenant)'
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

            // Verificar tenant del usuario
            const TenantModel = require('../models/tenant.model');
            const tenant = await TenantModel.getBySlug(tenant_slug);

            console.log('🔍 DEBUG - Tenant obtenido de BD:', {
                id: tenant?.id_tenant,
                nombre: tenant?.nombre_empresa,
                slug: tenant?.slug,
                plan: tenant?.plan,
                completo: tenant
            });

            if (!tenant) {
                return res.status(401).json({
                    success: false,
                    message: 'Empresa no encontrada'
                });
            }

            if (!tenant.activo) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado: La empresa está desactivada'
                });
            }

            // Verificar que el usuario pertenece al tenant
            if (user.id_tenant !== tenant.id_tenant) {
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

            // Generar token JWT con tenant_id
            const token = jwt.sign(
                {
                    userId: user.id_usuario,
                    email: user.email,
                    role: user.id_rol,
                    tenant_id: user.id_tenant,
                    tenant_slug: tenant.slug
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
                    },
                    tenant: {
                        id: tenant.id_tenant,
                        nombre: tenant.nombre_empresa,
                        nombre_empresa: tenant.nombre_empresa,
                        slug: tenant.slug,
                        plan: tenant.plan
                    }
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error de conexión. Intente nuevamente más tarde'
            });
        }
    }

    // Registro público de clientes (requiere tenant_id para aislamiento)
    static async registerPublic(req, res) {
        console.log('📝 Registro público - Body recibido:', req.body);
        try {
            const { nombre, email, password, telefono, tenant_id } = req.body;

            // Validar datos requeridos
            if (!nombre || !email || !password) {
                console.log('❌ Faltan campos obligatorios');
                return res.status(400).json({
                    success: false,
                    message: 'Nombre, email y contraseña son obligatorios'
                });
            }

            // VALIDACIÓN CRÍTICA: tenant_id es OBLIGATORIO para aislamiento
            if (!tenant_id) {
                console.log('❌ Falta tenant_id');
                return res.status(400).json({
                    success: false,
                    message: 'Debe registrarse desde una tienda específica'
                });
            }

            // Verificar si el email ya existe
            console.log('🔍 Verificando email:', email);
            const existingUser = await UsuarioModel.getByEmail(email);
            if (existingUser) {
                console.log('❌ Email ya existe');
                return res.status(400).json({
                    success: false,
                    message: 'El correo ingresado ya está registrado'
                });
            }

            // Crear usuario con rol de cliente (id_rol = 3)
            console.log('✅ Creando usuario con rol cliente...');
            const userData = {
                nombre,
                apellido: '',
                email,
                password,
                telefono: telefono || null,
                id_rol: 3, // Cliente
                id_tenant: parseInt(tenant_id) // OBLIGATORIO para aislamiento
            };

            console.log(`📍 Asignando usuario al tenant: ${tenant_id}`);

            const userId = await UsuarioModel.create(userData, parseInt(tenant_id));

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
                message: 'Error de conexión. Intente nuevamente más tarde'
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

    // Verificar contraseña del usuario actual (para confirmación de acciones críticas)
    static async verifyPassword(req, res) {
        try {
            const { password } = req.body;
            const userId = req.user.userId;

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña es requerida'
                });
            }

            // Obtener usuario con contraseña
            const user = await UsuarioModel.getByIdWithPassword(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Validar contraseña
            const isValidPassword = await UsuarioModel.validatePassword(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Contraseña incorrecta'
                });
            }

            res.json({
                success: true,
                message: 'Contraseña verificada correctamente'
            });

        } catch (error) {
            console.error('Error verificando contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = AuthController;
