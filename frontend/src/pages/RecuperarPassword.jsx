import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function RecuperarPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [formData, setFormData] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    verificarToken();
  }, [token]);

  const verificarToken = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/password-recovery/verificar/${token}`);
      const data = await response.json();

      if (data.success) {
        setTokenValido(true);
      } else {
        toast.error(data.message);
        setTokenValido(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al verificar el token');
      setTokenValido(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.nuevaPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.nuevaPassword !== formData.confirmarPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setGuardando(true);
      const response = await fetch('http://localhost:3000/api/password-recovery/resetear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          nuevaPassword: formData.nuevaPassword,
          confirmarPassword: formData.confirmarPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al resetear la contraseña');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Verificando...</span>
          </div>
          <p className="mt-3 text-muted">Verificando token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValido) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="card shadow">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
                  </div>
                  
                  <h3 className="mb-3">Token Inválido o Expirado</h3>
                  
                  <p className="text-muted mb-4">
                    El link de recuperación es inválido o ya expiró. Los links son válidos por 1 hora.
                  </p>

                  <div className="d-grid gap-2">
                    <Link to="/olvide-password" className="btn btn-primary">
                      <i className="bi bi-arrow-repeat me-2"></i>
                      Solicitar Nuevo Link
                    </Link>
                    
                    <Link to="/login" className="btn btn-outline-secondary">
                      <i className="bi bi-arrow-left me-2"></i>
                      Volver al Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow">
              <div className="card-header bg-success text-white text-center py-3">
                <h4 className="mb-0">
                  <i className="bi bi-shield-check me-2"></i>
                  Crear Nueva Contraseña
                </h4>
              </div>
              
              <div className="card-body p-4">
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Token verificado. Ahora puedes crear una nueva contraseña.
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nuevaPassword" className="form-label">
                      Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="nuevaPassword"
                      name="nuevaPassword"
                      value={formData.nuevaPassword}
                      onChange={handleChange}
                      required
                      minLength={6}
                      disabled={guardando}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmarPassword" className="form-label">
                      Confirmar Contraseña *
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
                      disabled={guardando}
                      placeholder="Repite la contraseña"
                    />
                  </div>

                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={guardando}
                    >
                      {guardando ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Resetear Contraseña
                        </>
                      )}
                    </button>

                    <Link to="/login" className="btn btn-outline-secondary">
                      <i className="bi bi-arrow-left me-2"></i>
                      Volver al Login
                    </Link>
                  </div>
                </form>
              </div>

              <div className="card-footer text-center text-muted">
                <small>
                  <i className="bi bi-shield-lock me-1"></i>
                  Tu contraseña será encriptada de forma segura
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
