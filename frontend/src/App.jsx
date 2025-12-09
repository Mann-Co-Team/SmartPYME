import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import './i18n'; // Inicializar i18n

// Layouts
import PublicLayout from './components/Layout/PublicLayout';
import AdminLayout from './components/Layout/AdminLayout.jsx';

// Páginas
import HomePage from './pages/public/HomePage';
import TiendasList from './pages/public/TiendasList';
import RegistroEmpresa from './pages/public/RegistroEmpresa';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
import Checkout from './pages/public/Checkout';
import MisPedidos from './pages/public/MisPedidos';
import DetallePedido from './pages/public/DetallePedido';
import TiendaHome from './pages/public/TiendaHome';
import TiendaLogin from './pages/public/TiendaLogin';
import TiendaRegistro from './pages/public/TiendaRegistro';
import TiendaCheckout from './pages/public/TiendaCheckout';
import TiendaPedidos from './pages/public/TiendaPedidos';
import TiendaDetallePedido from './pages/public/TiendaDetallePedido';
import TiendaPerfil from './pages/public/TiendaPerfil';
import AdminEmpresaSelector from './pages/public/AdminEmpresaSelector';
import AdminLogin from './pages/admin/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminProductos from './pages/admin/Productos.jsx';
import AdminCategorias from './pages/admin/Categorias.jsx';
import AdminPedidos from './pages/admin/Pedidos.jsx';
import AdminDetallePedido from './pages/admin/DetallePedido.jsx';
import AdminUsuarios from './pages/admin/Usuarios.jsx';
import AdminSettings from './pages/admin/Settings.jsx';
import AdminReportes from './pages/admin/Reportes.jsx';
import AdminAuditoria from './pages/admin/Auditoria.jsx';
import AdminBackups from './pages/admin/Backups.jsx';
import CambiarPassword from './pages/CambiarPassword.jsx';
import Perfil from './pages/public/Perfil.jsx';
import OlvidePassword from './pages/OlvidePassword.jsx';
import RecuperarPassword from './pages/RecuperarPassword.jsx';
import PrivateRoute from './components/PrivateRoute';
import TestCarrito from './pages/TestCarrito';

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <BrowserRouter>
          <CartProvider>
            <Routes>
              {/* Página principal */}
              <Route path="/" element={<HomePage />} />

              {/* Página de prueba del carrito */}
              <Route path="/test-carrito" element={<TestCarrito />} />

              {/* Lista de tiendas */}
              <Route path="/tiendas" element={<TiendasList />} />

              {/* Registro de empresa */}
              <Route path="/registro-empresa" element={<RegistroEmpresa />} />

              {/* Registro público */}
              <Route path="/registro" element={<Register />} />

              {/* Login público */}
              <Route path="/login" element={<Login />} />

              {/* Rutas de tiendas por tenant */}
              <Route path="/tienda/:tenant_slug" element={<TiendaHome />} />
              <Route path="/tienda/:tenant_slug/login" element={<TiendaLogin />} />
              <Route path="/tienda/:tenant_slug/registro" element={<TiendaRegistro />} />
              <Route path="/tienda/:tenant_slug/checkout" element={<TiendaCheckout />} />
              <Route path="/tienda/:tenant_slug/pedidos" element={<TiendaPedidos />} />
              <Route path="/tienda/:tenant_slug/pedidos/:id" element={<TiendaDetallePedido />} />
              <Route path="/tienda/:tenant_slug/perfil" element={<TiendaPerfil />} />

              {/* Recuperación de contraseña - Rutas públicas */}
              <Route path="/olvide-password" element={<OlvidePassword />} />
              <Route path="/recuperar-password/:token" element={<RecuperarPassword />} />

              {/* Selector de empresa para admin */}
              <Route path="/admin/seleccionar-empresa" element={<AdminEmpresaSelector />} />

              {/* Perfil del usuario */}
              <Route path="/perfil" element={
                <PublicLayout>
                  <Perfil />
                </PublicLayout>
              } />

              {/* Checkout - Ruta protegida para clientes */}
              <Route path="/checkout" element={
                <PublicLayout>
                  <Checkout />
                </PublicLayout>
              } />

              {/* Mis Pedidos - Ruta para clientes */}
              <Route path="/pedidos" element={
                <PublicLayout>
                  <MisPedidos />
                </PublicLayout>
              } />

              {/* RF-4: Detalle de Pedido - Ruta para clientes */}
              <Route path="/pedidos/:id" element={
                <PublicLayout>
                  <DetallePedido />
                </PublicLayout>
              } />

              {/* Cambiar contraseña - Ruta protegida para usuarios autenticados */}
              <Route path="/cambiar-password" element={
                <PublicLayout>
                  <CambiarPassword />
                </PublicLayout>
              } />

              {/* Login admin con tenant en URL */}
              <Route path="/:tenant_slug/admin/login" element={<AdminLogin />} />

              {/* Rutas admin protegidas con tenant en URL */}
              <Route path="/:tenant_slug/admin" element={<PrivateRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="productos" element={<AdminProductos />} />
                  <Route path="categorias" element={<AdminCategorias />} />
                  <Route path="pedidos" element={<AdminPedidos />} />
                  <Route path="pedidos/:id" element={<AdminDetallePedido />} />
                  <Route path="usuarios" element={<AdminUsuarios />} />
                  <Route path="reportes" element={<AdminReportes />} />
                  <Route path="auditoria" element={<AdminAuditoria />} />
                  <Route path="backups" element={<AdminBackups />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="cambiar-password" element={<CambiarPassword />} />
                </Route>
              </Route>

              {/* Redirect legacy admin routes */}
              <Route path="/admin/login" element={<Navigate to="/" replace />} />
              <Route path="/admin/*" element={<Navigate to="/" replace />} />
            </Routes>

            <Toaster position="top-right" />
          </CartProvider>
        </BrowserRouter>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
