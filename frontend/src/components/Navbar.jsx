import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎓 Plateforme de Stages
        </Link>

        <ul className="navbar-menu">
          <li>
            <Link to="/internships">Stages</Link>
          </li>

          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/login">Connexion</Link>
              </li>
              <li>
                <Link to="/register/student" className="btn btn-primary">
                  Inscription Étudiant
                </Link>
              </li>
              <li>
                <Link to="/register/company" className="btn btn-secondary">
                  Inscription Entreprise
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>

              {user?.role === 'student' && (
                <li>
                  <Link to="/my-applications">Mes Candidatures</Link>
                </li>
              )}

              {user?.role === 'company' && (
                <li>
                  <Link to="/create-internship">Créer un Stage</Link>
                </li>
              )}

              <li>
                <span className="user-info">
                  👤 {user?.email || user?.profile?.fullName || user?.companyName}
                </span>
              </li>

              <li>
                <button onClick={handleLogout} className="btn btn-logout">
                  Déconnexion
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;