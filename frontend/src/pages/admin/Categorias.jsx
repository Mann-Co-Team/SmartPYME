import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria, toggleCategoriaActive } from '../../services/categorias';
import ImageUpload from '../../components/ImageUpload';

export default function AdminCategorias() {
  const { t } = useTranslation();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error(t('admin.categories.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (categoria = null) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
        imagen: null,
      });
      setPreviewImage(categoria.imagen ? `http://localhost:3000${categoria.imagen}` : null);
    } else {
      setEditingCategoria(null);
      setFormData({
        nombre: '',
        descripcion: '',
        imagen: null,
      });
      setPreviewImage(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setFormData({
      nombre: '',
      descripcion: '',
      imagen: null,
    });
    setPreviewImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (file) => {
    setFormData(prev => ({
      ...prev,
      imagen: file
    }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(editingCategoria?.imagen ? `http://localhost:3000${editingCategoria.imagen}` : null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error(t('admin.categories.errorSaving'));
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      if (editingCategoria) {
        await updateCategoria(editingCategoria.id_categoria, formDataToSend);
        toast.success(t('admin.categories.updatedSuccess'));
      } else {
        await createCategoria(formDataToSend);
        toast.success(t('admin.categories.createdSuccess'));
      }

      handleCloseModal();
      cargarCategorias();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      toast.error(error.response?.data?.message || t('admin.categories.errorSaving'));
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleCategoriaActive(id);
      toast.success('Estado actualizado exitosamente');
      cargarCategorias();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const handleDeleteClick = (id, nombre) => {
    setCategoriaToDelete({ id, nombre });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoriaToDelete) return;

    try {
      await deleteCategoria(categoriaToDelete.id);
      toast.success(t('admin.categories.deletedSuccess'));
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
      cargarCategorias();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      toast.error(error.response?.data?.message || t('admin.categories.errorDeleting'));
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.categories.title')}</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + {t('admin.categories.addCategory')}
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 bg-blue-50 border-blue-200">
          <h3 className="text-sm text-blue-600 font-semibold">Total Categorías</h3>
          <p className="text-2xl font-bold text-blue-700">{categorias.length}</p>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <h3 className="text-sm text-green-600 font-semibold">Activas</h3>
          <p className="text-2xl font-bold text-green-700">
            {categorias.filter(c => c.activo).length}
          </p>
        </div>
        <div className="card p-4 bg-gray-50 border-gray-200">
          <h3 className="text-sm text-gray-600 font-semibold">Inactivas</h3>
          <p className="text-2xl font-bold text-gray-700">
            {categorias.filter(c => !c.activo).length}
          </p>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.categories.image')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.categories.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.categories.description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.common.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No hay categorías registradas. ¡Crea la primera!
                  </td>
                </tr>
              ) : (
                categorias.map((categoria) => (
                  <tr key={categoria.id_categoria} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {categoria.imagen ? (
                        <img
                          src={`http://localhost:3000${categoria.imagen}`}
                          alt={categoria.nombre}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Sin imagen</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{categoria.nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {categoria.descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(categoria.id_categoria)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${categoria.activo
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                      >
                        {categoria.activo ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(categoria)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(categoria.id_categoria, categoria.nombre)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen
                    </label>
                    <ImageUpload
                      onImageChange={handleImageChange}
                      currentImage={previewImage}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingCategoria ? 'Actualizar' : 'Crear'} Categoría
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Confirmar Eliminación</h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de eliminar la categoría "<strong>{categoriaToDelete?.nombre}</strong>"?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCategoriaToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
