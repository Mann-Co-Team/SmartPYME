import api from './api';

// Sistema de autenticación multi-tenant aislado
const TENANT_SESSIONS_KEY = 'tenant_sessions';

// Obtener todas las sesiones por tenant
const getTenantSessions = () => {
  const sessions = localStorage.getItem(TENANT_SESSIONS_KEY);
  return sessions ? JSON.parse(sessions) : {};
};

// Guardar sesión para un tenant específico
const setTenantSession = (tenantSlug, sessionData) => {
  const sessions = getTenantSessions();
  sessions[tenantSlug] = {
    ...sessionData,
    lastAccess: Date.now()
  };
  localStorage.setItem(TENANT_SESSIONS_KEY, JSON.stringify(sessions));
};

// Obtener sesión de un tenant específico
const getTenantSession = (tenantSlug) => {
  const sessions = getTenantSessions();
  return sessions[tenantSlug] || null;
};

// Eliminar sesión de un tenant específico
const removeTenantSession = (tenantSlug) => {
  const sessions = getTenantSessions();
  delete sessions[tenantSlug];
  localStorage.setItem(TENANT_SESSIONS_KEY, JSON.stringify(sessions));
};

export const login = async (credentials) => {
  // Si tiene tenant_slug, es login de admin/empleado
  const endpoint = credentials.tenant_slug ? '/auth/admin/login' : '/auth/login';
  const response = await api.post(endpoint, credentials);
  return response;
};

export const logout = (tenantSlug = null) => {
  if (tenantSlug) {
    // Cerrar sesión solo en este tenant
    removeTenantSession(tenantSlug);
    // Limpiar también el storage global si coincide con este tenant
    const currentTenant = localStorage.getItem('current_tenant');
    if (currentTenant === tenantSlug) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
      localStorage.removeItem('current_tenant');
    }
  } else {
    // Cerrar sesión global (admin)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    localStorage.removeItem('current_tenant');
  }
};

export const getCurrentUser = (tenantSlug = null) => {
  if (tenantSlug) {
    // Obtener usuario de la sesión del tenant específico
    const session = getTenantSession(tenantSlug);
    return session?.user || null;
  }
  // Fallback al storage global
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = (tenantSlug = null) => {
  if (tenantSlug) {
    // Verificar si hay sesión activa para este tenant
    const session = getTenantSession(tenantSlug);
    return !!session?.token;
  }
  // Fallback al storage global
  return !!localStorage.getItem('token');
};

export const getCurrentTenant = () => {
  const tenant = localStorage.getItem('tenant');
  return tenant ? JSON.parse(tenant) : null;
};

export const getToken = (tenantSlug = null) => {
  if (tenantSlug) {
    const session = getTenantSession(tenantSlug);
    return session?.token || null;
  }
  return localStorage.getItem('token');
};

export const setTenantAuth = (tenantSlug, token, user, tenant) => {
  // Limpiar cualquier sesión anterior
  localStorage.clear();
  
  // Guardar nueva sesión
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('tenant', JSON.stringify(tenant));
  localStorage.setItem('current_tenant', tenantSlug);
};

// Verificar contraseña del usuario actual (para confirmación de acciones críticas)
export const verifyPassword = async (password) => {
  const response = await api.post('/auth/verify-password', { password });
  return response.data;
};
