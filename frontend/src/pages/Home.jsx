import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllInternships, getGlobalStats } from '../services/api';


const Home = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byField: [],
    byType: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [internshipsRes, statsRes] = await Promise.all([
        getAllInternships({ limit: 6 }),
        getGlobalStats()
      ]);

      if (internshipsRes.success) setInternships(internshipsRes.data.slice(0, 6));
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content fadeIn">
            <span className="badge">✨ #1 Plateforme de Stages en Tunisie</span>
            <h1>Trouvez le Stage de <br /><span className="text-gradient">vos Rêves</span></h1>
            <p className="hero-subtitle">
              Connectez-vous avec les leaders de l'industrie et propulsez votre carrière
              grâce à des opportunités exclusives.
            </p>
            <div className="hero-buttons">
              <Link to="/internships" className="btn btn-primary btn-lg">
                Explorer les Offres
              </Link>
              <Link to="/register/student" className="btn btn-outline btn-lg">
                Créer un Profil
              </Link>
            </div>
          </div>

          <div className="hero-stats-grid">
            <div className="stat-item glass">
              <div className="stat-value">{stats.total || '250'}+</div>
              <div className="stat-label">Offres Publiées</div>
            </div>
            <div className="stat-item glass">
              <div className="stat-value">50+</div>
              <div className="stat-label">Entreprises</div>
            </div>
            <div className="stat-item glass">
              <div className="stat-value">2k+</div>
              <div className="stat-label">Étudiants</div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section container">
        <div className="section-header">
          <div>
            <h2>🔥 Dernières Opportunités</h2>
            <p>Stages récemment publiés par nos partenaires</p>
          </div>
          <Link to="/internships" className="btn btn-outline btn-sm">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card glass" />)}
          </div>
        ) : internships.length === 0 ? (
          <div className="empty-state glass">
            <p>📭 Aucun stage disponible pour le moment</p>
          </div>
        ) : (
          <div className="internships-grid">
            {internships.map((internship) => (
              <div key={internship._id} className="internship-card glass">
                <div className="card-top">
                  <div className="company-info">
                    <img
                      src={internship.companyId?.logoUrl || 'https://via.placeholder.com/60'}
                      alt={internship.companyId?.companyName}
                      className="company-logo"
                    />
                    <div>
                      <h3>{internship.title}</h3>
                      <p>{internship.companyId?.companyName || 'Entreprise'}</p>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="tags">
                    <span className="tag">{internship.field}</span>
                    <span className="tag-outline">{internship.type}</span>
                  </div>
                  <p>{internship.description.substring(0, 100)}...</p>
                </div>

                <div className="card-footer">
                  <div className="meta">
                    <span>📍 {internship.location?.city || 'Tunis'}</span>
                    <span>📅 {internship.duration} mois</span>
                  </div>
                  <Link to={`/internships/${internship._id}`} className="btn btn-primary btn-sm">
                    Détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="how-it-works container">
        <h2 className="text-center">Simple & Rapide ⚡</h2>
        <div className="steps-grid">
          {[
            { n: '01', t: 'Créez Profil', d: 'Mettez en avant vos compétences' },
            { n: '02', t: 'Postulez', d: 'En un clic aux meilleures offres' },
            { n: '03', t: 'Décrochez', d: 'Passez vos entretiens sereinement' }
          ].map((step, i) => (
            <div key={i} className="step-card glass">
              <span className="step-num">{step.n}</span>
              <h3>{step.t}</h3>
              <p>{step.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;