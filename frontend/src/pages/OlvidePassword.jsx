import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OlvidePassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [tokenDev, setTokenDev] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/password-recovery/solicitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setEnviado(true);
        if (data.dev_token) {
          setTokenDev(data.dev_token);
        }
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <i className="bi bi-envelope-check text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  
                  <h3 className="mb-3">¡Revisa tu correo!</h3>
                  
                  <p className="text-muted mb-4">
                    Si el email <strong>{email}</strong> está registrado, recibirás instrucciones
                    para recuperar tu contraseña.
                  </p>

                  {tokenDev && (
                    <div className="alert alert-warning">
                      <strong>Modo Desarrollo:</strong>
                      <br />
                      <small>Como no hay servicio de email configurado, usa este link:</small>
                      <div className="mt-2">
                        <Link 
                          to={`/recuperar-password/${tokenDev}`}
                          className="btn btn-sm btn-primary"
                        >
                          Resetear Contraseña
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2 mt-4">
                    <Link to="/login" className="btn btn-outline-primary">
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
              <div className="card-header bg-primary text-white text-center py-3">
                <h4 className="mb-0">
                  <i className="bi bi-key me-2"></i>
                  ¿Olvidaste tu contraseña?
                </h4>
              </div>
              
              <div className="card-body p-4">
                <p className="text-muted mb-4">
                  No te preocupes. Ingresa tu email y te enviaremos instrucciones
                  para resetear tu contraseña.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        disabled={loading}
                      />
                    </div>
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
                          Enviando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Enviar Instrucciones
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
                  <i className="bi bi-info-circle me-1"></i>
                  El link de recuperación expira en 1 hora
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
