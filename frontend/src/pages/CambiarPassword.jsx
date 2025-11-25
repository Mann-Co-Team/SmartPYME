import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CambiarPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones frontend
    if (!formData.passwordActual || !formData.passwordNueva || !formData.confirmarPassword) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    if (formData.passwordNueva.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.passwordNueva !== formData.confirmarPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3000/api/usuarios/cambiar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Contraseña actualizada exitosamente');
        setFormData({
          passwordActual: '',
          passwordNueva: '',
          confirmarPassword: ''
        });
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        toast.error(data.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-key me-2"></i>
                Cambiar Contraseña
              </h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="passwordActual" className="form-label">
                    Contraseña Actual *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="passwordActual"
                    name="passwordActual"
                    value={formData.passwordActual}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="passwordNueva" className="form-label">
                    Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="passwordNueva"
                    name="passwordNueva"
                    value={formData.passwordNueva}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <small className="text-muted">
                    Mínimo 6 caracteres
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmarPassword" className="form-label">
                    Confirmar Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmarPassword"
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Actualizar Contraseña
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="alert alert-info mt-3">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Importante:</strong> Después de cambiar tu contraseña, asegúrate de recordarla o guardarla en un lugar seguro.
          </div>
        </div>
      </div>
    </div>
  );
}
