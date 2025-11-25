const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el usuario aún existe y está activo
        const [rows] = await db.execute(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.id_rol, r.nombre_rol 
             FROM usuarios u 
             JOIN roles r ON u.id_rol = r.id_rol 
             WHERE u.id_usuario = ? AND u.activo = TRUE`,
            [decoded.userId]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no válido' });
        }

        req.user = {
            ...rows[0],
            userId: rows[0].id_usuario,
            role: rows[0].id_rol,  // Agregar alias para compatibilidad
            rol: rows[0].nombre_rol,  // Agregar nombre del rol
            tenant_id: decoded.tenant_id,  // Pasar tenant_id del JWT
            tenant_slug: decoded.tenant_slug  // Pasar tenant_slug del JWT
        };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        if (!roles.includes(req.user.id_rol)) {
            return res.status(403).json({ message: 'No tiene permisos para esta acción' });
        }

        next();
    };
};

module.exports = { authenticateToken, requireRole };
