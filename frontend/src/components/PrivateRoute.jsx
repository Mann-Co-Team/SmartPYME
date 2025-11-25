import { Navigate, Outlet, useParams } from 'react-router-dom';

const PrivateRoute = () => {
  const { tenant_slug } = useParams();
  const token = localStorage.getItem('token');
  const currentTenant = localStorage.getItem('current_tenant');
  
  // Si no hay token, redirigir al login
  if (!token) {
    const loginPath = tenant_slug ? `/${tenant_slug}/admin/login` : '/admin/login';
    return <Navigate to={loginPath} />;
  }
  
  // Si hay tenant_slug en la URL, verificar que coincida con el tenant logueado
  if (tenant_slug && currentTenant !== tenant_slug) {
    // Está intentando acceder a otra empresa, redirigir a su login
    return <Navigate to={`/${tenant_slug}/admin/login`} />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;
