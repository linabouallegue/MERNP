import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllInternships } from '../services/api';
import './Home.css';

const Home = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    totalInternships: 0,
    totalCompanies: 50,
    totalStudents: 200
  });

  useEffect(() => {
    fetchRecentInternships();
  }, []);

  const fetchRecentInternships = async () => {
    try {
      const response = await getAllInternships();
      setInternships(response.data.slice(0, 6));
    } catch (error) {
      console.error('Erreur chargement stages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>🎓 Trouvez le Stage de vos Rêves</h1>
          <p className="hero-subtitle">
            La plateforme qui connecte les étudiants tunisiens avec les meilleures entreprises
          </p>
          <div className="hero-buttons">
            <Link to="/internships" className="btn btn-primary btn-lg">
              Voir les Stages
            </Link>
            <Link to="/register/student" className="btn btn-secondary btn-lg">
              Commencer Gratuitement
            </Link>
          </div>
        </div>
        
        <div className="hero-stats">
          <div className="stat-card">
            <h3>{stats.totalInternships}+</h3>
            <p>Stages Disponibles</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalCompanies}+</h3>
            <p>Entreprises Partenaires</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalStudents}+</h3>
            <p>Étudiants Inscrits</p>
          </div>
        </div>
      </section>

      <section className="recent-internships">
        <div className="section-header">
          <h2>🔥 Stages Récents</h2>
          <Link to="/internships" className="view-all">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="loading">Chargement des stages...</div>
        ) : internships.length === 0 ? (
          <div className="empty-state">
            <p>📭 Aucun stage disponible pour le moment</p>
          </div>
        ) : (
          <div className="internships-grid">
            {internships.map((internship) => (
              <div key={internship._id} className="internship-card">
                <div className="card-header">
                  <img 
                    src={internship.companyId?.logoUrl || 'https://via.placeholder.com/100'} 
                    alt={internship.companyId?.companyName}
                    className="company-logo"
                  />
                  <div className="card-title">
                    <h3>{internship.title}</h3>
                    <p className="company-name">
                      {internship.companyId?.companyName || 'Entreprise'}
                    </p>
                  </div>
                </div>

                <div className="card-tags">
                  <span className="tag tag-field">{internship.field}</span>
                  <span className="tag tag-type">{internship.type}</span>
                </div>

                <p className="internship-description">
                  {internship.description.substring(0, 100)}...
                </p>

                <div className="card-footer">
                  <span className="duration">📅 {internship.duration} mois</span>
                  <span className="location">📍 {internship.location?.city || 'À distance'}</span>
                </div>

                <Link to={`/internships/${internship._id}`} className="btn btn-outline btn-block">
                  Voir Détails
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="how-it-works">
        <h2>💡 Comment ça marche ?</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Créez votre compte</h3>
            <p>Inscription gratuite en quelques secondes</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Parcourez les offres</h3>
            <p>Des centaines de stages disponibles</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Postulez facilement</h3>
            <p>Envoyez votre candidature en un clic</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Décrochez votre stage</h3>
            <p>Les entreprises vous contactent directement</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>🚀 Prêt à commencer ?</h2>
        <p>Rejoignez des milliers d'étudiants qui ont trouvé leur stage idéal</p>
        <div className="cta-buttons">
          <Link to="/register/student" className="btn btn-white btn-lg">
            Je suis Étudiant
          </Link>
          <Link to="/register/company" className="btn btn-outline-white btn-lg">
            Je suis Entreprise
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;