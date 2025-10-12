import React, { useEffect, useState } from 'react';
import { getPedidos } from '../services/pedidos';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const data = await getPedidos();
      setPedidos(data);
    } catch (err) {
      console.error('Error al cargar pedidos', err);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Gestión de Pedidos</h1>
      <ul className="list-group">
        {pedidos.map((p) => (
          <li key={p.id_pedido} className="list-group-item">
            <div><strong>Pedido #{p.id_pedido}</strong></div>
            <div>Cliente: {p.cliente}</div>
            <div>Estado: {p.nombre_estado}</div>
            <div>Total: ${p.total}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
