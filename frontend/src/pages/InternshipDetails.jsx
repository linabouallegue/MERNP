import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInternshipById, applyToInternship, optimizeAICoverLetter } from '../services/api';
import { useAuth } from '../context/AuthContext';

const InternshipDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [applicationData, setApplicationData] = useState({
        coverLetter: '',
        resumeUrl: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleOptimizeLetter = async () => {
        if (!applicationData.coverLetter) return;
        setOptimizing(true);
        try {
            const data = await optimizeAICoverLetter({
                coverLetter: applicationData.coverLetter,
                internshipTitle: internship.title
            });
            if (data.success) {
                setApplicationData({ ...applicationData, coverLetter: data.optimizedLetter });
            }
        } catch (err) {
            console.error('Erreur optimisation:', err);
            setError('Impossible d\'optimiser la lettre avec l\'IA pour le moment.');
        } finally {
            setOptimizing(false);
        }
    };


    useEffect(() => {
        fetchInternship();
    }, [id]);

    const fetchInternship = async () => {
        try {
            const data = await getInternshipById(id);
            if (data.success) {
                setInternship(data.data);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les détails du stage.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await applyToInternship({
                internshipId: id,
                coverLetter: applicationData.coverLetter,
                resumeUrl: applicationData.resumeUrl || user?.profile?.cvUrl
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => setShowModal(false), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la candidature.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-spinner container"><div className="spinner"></div></div>;
    if (!internship) return <div className="container text-center py-5"><h2>Stage introuvable</h2></div>;

    return (
        <div className="internship-details-page container fadeIn">
            <div className="details-header glass">
                <div className="company-branding">
                    <img
                        src={internship.companyId?.logoUrl || 'https://via.placeholder.com/100'}
                        className="details-logo"
                        alt={internship.companyId?.companyName}
                    />
                    <div>
                        <h1>{internship.title}</h1>
                        <p className="company-link">{internship.companyId?.companyName}</p>
                    </div>
                </div>
                <div className="header-actions">
                    {user?.role === 'student' || !isAuthenticated ? (
                        <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
                            Postuler Maintenant
                        </button>
                    ) : (
                        <p className="badge">Espace Recruteur</p>
                    )}
                </div>
            </div>

            <div className="details-grid">
                <div className="details-main glass">
                    <section className="detail-section">
                        <h3>📝 Description du Poste</h3>
                        <p>{internship.description}</p>
                    </section>

                    <section className="detail-section">
                        <h3>🎯 Compétences Requises</h3>
                        <div className="skills-tags">
                            {internship.requiredSkills?.map((skill, i) => (
                                <span key={i} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </section>

                    <section className="detail-section">
                        <h3>🎓 Niveau & Éducation</h3>
                        <p><strong>Niveau requis :</strong> {internship.requiredLevel}</p>
                    </section>
                </div>

                <aside className="details-sidebar">
                    <div className="info-card glass">
                        <h3>Aperçu</h3>
                        <ul className="info-list">
                            <li><span>📍 Ville</span> <strong>{internship.location?.city}</strong></li>
                            <li><span>📅 Durée</span> <strong>{internship.duration} mois</strong></li>
                            <li><span>🚀 Début</span> <strong>{new Date(internship.startDate).toLocaleDateString()}</strong></li>
                            <li><span>💎 Rémunération</span> <strong>{internship.salary?.isPaid ? `${internship.salary.amount} ${internship.salary.currency}` : 'Non rémunéré'}</strong></li>
                            <li><span>👥 Places</span> <strong>{internship.availableSpots} postes</strong></li>
                        </ul>
                    </div>

                    <div className="company-card glass">
                        <h3>À propos de l'entreprise</h3>
                        <p className="industry-tag">{internship.companyId?.industry}</p>
                        <p>{internship.companyId?.description?.substring(0, 150)}...</p>
                        {internship.companyId?.website && (
                            <a href={internship.companyId.website} target="_blank" rel="noreferrer" className="btn btn-outline btn-block btn-sm">
                                Visiter le site
                            </a>
                        )}
                    </div>
                </aside>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass fadeIn">
                        <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>

                        {success ? (
                            <div className="success-state text-center">
                                <h2>Candidature Envoyée ! 🎉</h2>
                                <p>Votre demande a été transmise à {internship.companyId.companyName}. Bonne chance !</p>
                                <button className="btn btn-primary" onClick={() => setShowModal(false)}>Fermer</button>
                            </div>
                        ) : (
                            <>
                                <h2>Postuler pour {internship.title}</h2>
                                <form onSubmit={handleApply} className="application-form">
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label>Lettre de Motivation</label>
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                onClick={handleOptimizeLetter}
                                                disabled={optimizing || !applicationData.coverLetter}
                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                            >
                                                {optimizing ? '🪄 IA en cours...' : '💎 Optimiser avec l\'IA'}
                                            </button>
                                        </div>
                                        <textarea
                                            required
                                            rows="6"
                                            placeholder="Expliquez pourquoi vous êtes le candidat idéal..."
                                            value={applicationData.coverLetter}
                                            onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Lien vers votre CV (PDF/Drive)</label>
                                        <input
                                            type="url"
                                            placeholder="https://votre-portfolio.com/cv.pdf"
                                            value={applicationData.resumeUrl}
                                            onChange={(e) => setApplicationData({ ...applicationData, resumeUrl: e.target.value })}
                                        />
                                    </div>
                                    {error && <p className="alert alert-error">{error}</p>}
                                    <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                                        {submitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InternshipDetails;
