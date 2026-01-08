import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerStudent } from '../services/api';

const RegisterStudent = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await registerStudent(formData);
      if (data.success) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Échec de l\'inscription');
      }
    } catch (err) {
      console.error('Erreur inscription:', err);
      const detail = err.response?.data?.message || err.message;
      const debugInfo = JSON.stringify(err.response?.data || {}, null, 2);
      setError(`Erreur: ${detail} \n Debug: ${debugInfo}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-header">
          <h1>Rejoignez-nous 🎓</h1>
          <p>Créez votre compte étudiant dès aujourd'hui</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nom Complet</label>
            <input
              type="text"
              name="fullName"
              placeholder="Prénom Nom"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Étudiant</label>
            <input
              type="email"
              name="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de Passe</label>
            <input
              type="password"
              name="password"
              placeholder="Min. 8 caractères"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Création...' : 'S\'inscrire comme Étudiant'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
