import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Pour cet exemple, on utilise des appels génériques
            // Dans un cas réel, on aurait des endpoints de dashboard dédiés
            if (user.role === 'student') {
                const res = await api.get('/applications/my-applications');
                if (res.data.success) {
                    setActivities(res.data.data);
                    setStats({
                        total: res.data.data.length,
                        pending: res.data.data.filter(a => a.status === 'pending').length,
                        accepted: res.data.data.filter(a => a.status === 'accepted').length
                    });
                }
            } else {
                const res = await api.get('/internships/company/me');
                if (res.data.success) {
                    setActivities(res.data.data);
                    setStats({
                        total: res.data.data.length,
                        active: res.data.data.filter(i => i.status === 'active').length,
                        totalApps: res.data.data.reduce((acc, i) => acc + (i.applicationsCount || 0), 0)
                    });
                }
            }
        } catch (err) {
            console.error('Erreur dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner container"><div className="spinner"></div></div>;

    return (
        <div className="dashboard-page container fadeIn">
            <header className="dashboard-header">
                <h1>Bienvenue, <span className="text-gradient">{user.fullName || user.companyName}</span></h1>
                <p>Voici un aperçu de votre activité sur la plateforme.</p>
            </header>

            <div className="stats-grid">
                {user.role === 'student' ? (
                    <>
                        <div className="stat-card glass">
                            <span className="stat-icon">📄</span>
                            <div className="stat-info">
                                <h3>{stats?.total || 0}</h3>
                                <p>Candidatures envoyées</p>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <span className="stat-icon">⏳</span>
                            <div className="stat-info">
                                <h3>{stats?.pending || 0}</h3>
                                <p>En attente</p>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <span className="stat-icon">✅</span>
                            <div className="stat-info">
                                <h3>{stats?.accepted || 0}</h3>
                                <p>Acceptées</p>
                            </div>
                        </div>
                        <Link to="/ai-assistant" className="stat-card glass ai-card">
                            <span className="stat-icon">🤖</span>
                            <div className="stat-info">
                                <h3>Assistant IA</h3>
                                <p>Coaching & CV</p>
                            </div>
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="stat-card glass">
                            <span className="stat-icon">💼</span>
                            <div className="stat-info">
                                <h3>{stats?.total || 0}</h3>
                                <p>Offres publiées</p>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <span className="stat-icon">👥</span>
                            <div className="stat-info">
                                <h3>{stats?.totalApps || 0}</h3>
                                <p>Total candidatures</p>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <span className="stat-icon">🔥</span>
                            <div className="stat-info">
                                <h3>{stats?.active || 0}</h3>
                                <p>Offres actives</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="dashboard-content">
                <div className="main-activity glass">
                    <div className="activity-header">
                        <h3>{user.role === 'student' ? 'Mes Candidatures Récentes' : 'Mes Offres Récentes'}</h3>
                        <Link to={user.role === 'student' ? '/my-applications' : '/internships'} className="btn btn-outline btn-sm">
                            Voir tout
                        </Link>
                    </div>

                    <div className="activity-list">
                        {activities.length === 0 ? (
                            <div className="empty-activity text-center">
                                <p>Aucune activité pour le moment.</p>
                                <Link to={user.role === 'student' ? '/internships' : '/create-internship'} className="btn btn-primary btn-sm">
                                    {user.role === 'student' ? 'Chercher un stage' : 'Publier une offre'}
                                </Link>
                            </div>
                        ) : (
                            activities.slice(0, 5).map((item) => (
                                <div key={item._id} className="activity-item">
                                    <div className="item-main">
                                        <h4>{user.role === 'student' ? item.internshipId?.title : item.title}</h4>
                                        <span className={`status-badge ${item.status}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="item-meta">
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <aside className="quick-actions glass">
                    <h3>Actions Rapides</h3>
                    <div className="actions-list">
                        {user.role === 'student' ? (
                            <>
                                <Link to="/internships" className="action-btn">🔍 Chercher des stages</Link>
                                <Link to="/profile" className="action-btn">👤 Compléter mon profil</Link>
                                <Link to="/my-applications" className="action-btn">📂 Suivre mes demandes</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/create-internship" className="action-btn">➕ Publier une offre</Link>
                                <Link to="/applications" className="action-btn">👥 Gérer les candidats</Link>
                                <Link to="/profile" className="action-btn">🏢 Editer page entreprise</Link>
                            </>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Dashboard;
