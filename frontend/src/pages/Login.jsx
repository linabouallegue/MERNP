import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginService({ email, password });
      if (data.success) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Échec de la connexion');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects ou erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-header">
          <h1>Bon Retour ! 👋</h1>
          <p>Connectez-vous pour accéder à votre espace</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Professionnel / Étudiant</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de Passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se Connecter'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Pas encore de compte ?</p>
          <div className="register-links">
            <Link to="/register/student">S'inscrire comme Étudiant</Link>
            <span>ou</span>
            <Link to="/register/company">S'inscrire comme Entreprise</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
