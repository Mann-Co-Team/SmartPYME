// Hook personalizado para verificar permisos del usuario
export const usePermissions = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.id_rol;

  const permissions = {
    // Permisos de admin (rol 1)
    isAdmin: userRole === 1,
    canManageUsers: userRole === 1,
    canManageSettings: userRole === 1,
    canDeleteProducts: userRole === 1,
    canDeleteCategories: userRole === 1,
    canDeleteOrders: userRole === 1,
    
    // Permisos compartidos (admin y empleado)
    isEmployee: userRole === 2,
    canManageProducts: [1, 2].includes(userRole),
    canManageCategories: [1, 2].includes(userRole),
    canManageOrders: [1, 2].includes(userRole),
    canViewDashboard: [1, 2].includes(userRole),
    
    // Información del usuario
    userRole,
    userName: `${user.nombre || ''} ${user.apellido || ''}`.trim(),
    userEmail: user.email
  };

  return permissions;
};

// Componente para renderizar contenido según permisos
export const PermissionGuard = ({ permission, children, fallback = null }) => {
  const permissions = usePermissions();
  
  if (permissions[permission]) {
    return children;
  }
  
  return fallback;
};
