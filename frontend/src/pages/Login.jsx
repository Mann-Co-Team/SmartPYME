import { useState } from 'react';
import { login } from '../services/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      alert('Credenciales inválidas');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center py-3">
              <h4 className="mb-0">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Iniciar Sesión
              </h4>
            </div>
            
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="tu@ejemplo.com"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Tu contraseña"
                  />
                </div>

                <div className="text-end mb-3">
                  <Link to="/olvide-password" className="text-decoration-none small">
                    <i className="bi bi-question-circle me-1"></i>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="d-grid">
                  <button className="btn btn-primary" type="submit">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Ingresar
                  </button>
                </div>
              </form>
            </div>

            <div className="card-footer text-center">
              <small className="text-muted">
                ¿No tienes cuenta? <Link to="/registro" className="text-decoration-none">Regístrate aquí</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
