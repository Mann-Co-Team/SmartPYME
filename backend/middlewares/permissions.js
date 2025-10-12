const rolePermissions = {
    'admin': [
        'manage_users',
        'manage_products', 
        'manage_orders',
        'manage_categories',
        'view_dashboard',
        'manage_settings',
        'delete_products',
        'delete_orders'
    ],
    'empleado': [
        'manage_products',
        'manage_orders',
        'manage_categories',
        'view_dashboard'
    ],
    'cliente': [
        'create_order',
        'view_products',
        'view_profile',
        'update_profile'
    ]
};

const authorize = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'No autenticado' 
            });
        }

        const userRole = req.user.nombre_rol || req.user.rol;
        const userPermissions = rolePermissions[userRole] || [];

        if (!userPermissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                message: `Permiso denegado. Se requiere: ${permission}`
            });
        }

        next();
    };
};

module.exports = { authorize, rolePermissions };
