import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';

// Layouts
import PublicLayout from './components/Layout/PublicLayout';
import AdminLayout from './components/Layout/AdminLayout.jsx';

// Páginas
import HomePage from './pages/public/HomePage';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
import AdminLogin from './pages/admin/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminProductos from './pages/admin/Productos.jsx';
import AdminCategorias from './pages/admin/Categorias.jsx';
import AdminPedidos from './pages/admin/Pedidos.jsx';
import AdminSettings from './pages/admin/Settings.jsx';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta pública */}
            <Route path="/" element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            } />

            {/* Registro público */}
            <Route path="/registro" element={<Register />} />

            {/* Login público */}
            <Route path="/login" element={<Login />} />

            {/* Login admin */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Rutas admin protegidas */}
            <Route path="/admin" element={<PrivateRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="productos" element={<AdminProductos />} />
                <Route path="categorias" element={<AdminCategorias />} />
                <Route path="pedidos" element={<AdminPedidos />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Routes>
          
          <Toaster position="top-right" />
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
