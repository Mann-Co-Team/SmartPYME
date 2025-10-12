import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';   // ← Import
import Login from './pages/Login';
import Home from './pages/Home';
import Productos from './pages/Productos';
import Pedidos from './pages/Pedidos';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      {/* Muestra Navbar en todas las rutas protegidas */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Navbar />}>        {/* ← Envolvemos las rutas */}
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/pedidos" element={<Pedidos />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
