import React from 'react';

export default function AdminCategorias() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
        <button className="btn-primary">
          Agregar Categoría
        </button>
      </div>

      <div className="card p-6">
        <p className="text-gray-500">Lista de categorías aquí...</p>
      </div>
    </div>
  );
}
