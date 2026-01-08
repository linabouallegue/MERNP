import React, { useState, useEffect } from 'react';
import api, { getInternshipApplications, updateApplicationStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CompanyApplications = () => {
    const { user } = useAuth();
    const [internships, setInternships] = useState([]);
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appLoading, setAppLoading] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState(null);

    useEffect(() => {
        fetchCompanyInternships();
    }, []);

    const fetchCompanyInternships = async () => {
        try {
            const res = await api.get(`/internships/company/${user.id}`);
            if (res.data.success) {
                setInternships(res.data.data);
                if (res.data.data.length > 0) {
                    // Sélectionner le premier stage par défaut
                    handleSelectInternship(res.data.data[0]);
                } else {
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error('Erreur chargement stages:', err);
            setLoading(false);
        }
    };

    const handleSelectInternship = async (internship) => {
        setSelectedInternship(internship);
        setAppLoading(true);
        try {
            const data = await getInternshipApplications(internship._id);
            if (data.success) {
                setApplications(data.data);
            }
        } catch (err) {
            console.error('Erreur chargement candidatures:', err);
        } finally {
            setAppLoading(false);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            const res = await updateApplicationStatus(appId, { status: newStatus });
            if (res.success) {
                // Mettre à jour la liste localement
                setApplications(apps => apps.map(app =>
                    app._id === appId ? { ...app, status: newStatus } : app
                ));
            }
        } catch (err) {
            console.error('Erreur mise à jour statut:', err);
            alert('Impossible de mettre à jour le statut.');
        }
    };

    if (loading) return <div className="loading-spinner container"><div className="spinner"></div></div>;

    return (
        <div className="company-applications-page container fadeIn">
            <header className="page-header">
                <h1>Gestion des <span className="text-gradient">Candidatures</span></h1>
                <p>Gérez les talents pour vos offres de stage.</p>
            </header>

            <div className="applications-layout">
                {/* LISTE DES STAGES (Sidebar) */}
                <aside className="internships-sidebar glass">
                    <h3>Vos Offres</h3>
                    {internships.length === 0 ? (
                        <p className="text-muted">Aucune offre publiée.</p>
                    ) : (
                        <ul className="internships-nav">
                            {internships.map(internship => (
                                <li
                                    key={internship._id}
                                    className={selectedInternship?._id === internship._id ? 'active' : ''}
                                    onClick={() => handleSelectInternship(internship)}
                                >
                                    <div className="nav-item-content">
                                        <span className="nav-title">{internship.title}</span>
                                        <span className={`status-dot ${internship.status}`}></span>
                                    </div>
                                    <small>{new Date(internship.createdAt).toLocaleDateString()}</small>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* LISTE DES CANDIDATS (Main) */}
                <main className="applications-main glass">
                    {selectedInternship ? (
                        <>
                            <div className="main-header">
                                <h2>Candidats pour : {selectedInternship.title}</h2>
                                <span className="badge">{applications.length} candidat(s)</span>
                            </div>

                            {appLoading ? (
                                <div className="text-center py-5">Chargement...</div>
                            ) : applications.length === 0 ? (
                                <div className="empty-state">
                                    <p>Aucune candidature reçue pour le moment.</p>
                                </div>
                            ) : (
                                <div className="candidates-list">
                                    {applications.map(app => (
                                        <div key={app._id} className="candidate-card">
                                            <div className="candidate-header">
                                                <div className="candidate-info">
                                                    <h4>{app.studentProfile?.fullName || app.studentId.email}</h4>
                                                    <p>{app.studentProfile?.phone || 'Pas de téléphone'}</p>
                                                    <span className="date">Postulé le {new Date(app.appliedAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="candidate-actions">
                                                    <select
                                                        value={app.status}
                                                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                                        className={`status-select ${app.status}`}
                                                    >
                                                        <option value="pending">En attente</option>
                                                        <option value="reviewing">En cours</option>
                                                        <option value="accepted">Accepté</option>
                                                        <option value="rejected">Refusé</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="candidate-content">
                                                <div className="content-actions">
                                                    {app.resumeUrl && (
                                                        <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                                                            📄 Voir CV
                                                        </a>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => setSelectedLetter(selectedLetter === app._id ? null : app._id)}
                                                    >
                                                        {selectedLetter === app._id ? 'Masquer Lettre' : 'Lire Lettre'}
                                                    </button>
                                                </div>

                                                {selectedLetter === app._id && (
                                                    <div className="cover-letter fadeIn">
                                                        <h5>Lettre de motivation :</h5>
                                                        <p>{app.coverLetter}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-5">
                            <p>Sélectionnez une offre pour voir les candidats.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CompanyApplications;
