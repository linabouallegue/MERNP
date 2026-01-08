import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerCompany } from '../services/api';

const RegisterCompany = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    industry: '',
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
      const data = await registerCompany(formData);
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

  const industries = [
    'Technologie', 'Finance', 'Santé', 'Éducation',
    'Commerce', 'Industrie', 'Services', 'Autre'
  ];

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-header">
          <h1>Espace Entreprise 🏢</h1>
          <p>Recrutez les meilleurs talents tunisiens</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nom de l'Entreprise</label>
            <input
              type="text"
              name="companyName"
              placeholder="Ex: Tech Solutions"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Professionnel</label>
            <input
              type="email"
              name="email"
              placeholder="contact@entreprise.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Secteur d'Activité</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner un secteur</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mot de Passe</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Création...' : 'S\'inscrire comme Entreprise'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompany;
