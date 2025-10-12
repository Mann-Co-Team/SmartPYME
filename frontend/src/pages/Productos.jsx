import React, { useEffect, useState } from 'react';
import { getProductos } from '../services/productos';

export default function Productos() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (err) {
      console.error('Error al cargar productos', err);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Gestión de Productos</h1>
      <ul className="list-group">
        {productos.map((p) => (
          <li key={p.id_producto} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{p.nombre}</strong> - {p.categoria} - ${p.precio}
            </div>
            <span className={`badge ${p.activo ? 'bg-success' : 'bg-secondary'}`}>
              {p.activo ? 'Activo' : 'Inactivo'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
