// src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';  // Importation du hook d'authentification
import './Auth.css'; // Assurez-vous que le CSS est bien importé
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();  // Récupère la fonction login du contexte
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');  // Pour afficher des erreurs de validation
  const [loading, setLoading] = useState(false);  // Pour afficher un indicateur de chargement pendant la requête
  const navigate = useNavigate();  // Utilisation de useNavigate pour rediriger après la connexion

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation simple
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true); // Afficher un indicateur de chargement

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      if (response.data) {
        login(response.data); // Enregistre l'utilisateur dans le contexte
        navigate('/'); // Redirige vers la page d'accueil après la connexion
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false); // Cacher l'indicateur de chargement après la requête
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      {error && <p className="error-message">{error}</p>}  {/* Affichage des erreurs */}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>Login</button>  {/* Désactiver le bouton pendant le chargement */}
        {loading && <p>Loading...</p>}  {/* Affichage d'un message pendant le chargement */}
      </form>
    </div>
  );
};

export default Login;
