import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllInternships } from '../services/api';

const InternshipsList = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        field: '',
        type: '',
        search: ''
    });

    const fields = [
        'Développement Web', 'Mobile', 'Data Science', 'Cybersécurité',
        'Design UI/UX', 'Marketing Digital', 'Finance', 'RH'
    ];

    const types = ['Stage été', 'Stage PFE', 'Stage ouvrier', 'Stage technique'];

    useEffect(() => {
        fetchInternships();
    }, [filters.field, filters.type]);

    const fetchInternships = async () => {
        setLoading(true);
        try {
            const data = await getAllInternships(filters);
            if (data.success) {
                setInternships(data.data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des stages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchInternships();
    };

    return (
        <div className="internships-page container">
            <header className="page-header text-center">
                <h1>Explorer les <span className="text-gradient">Opportunités</span></h1>
                <p>Trouvez le stage parfait parmi des centaines d'offres</p>
            </header>

            <section className="filters-section glass">
                <form onSubmit={handleSearchSubmit} className="filters-grid">
                    <div className="filter-group search-box">
                        <input
                            type="text"
                            placeholder="Rechercher un poste, une techno..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                        <button type="submit" className="btn btn-primary">Rechercher</button>
                    </div>

                    <div className="filter-group">
                        <select
                            value={filters.field}
                            onChange={(e) => setFilters({ ...filters, field: e.target.value })}
                        >
                            <option value="">Tous les domaines</option>
                            {fields.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="">Tous les types</option>
                            {types.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </form>
            </section>

            <main className="results-section">
                {loading ? (
                    <div className="loading-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card glass" />)}
                    </div>
                ) : internships.length === 0 ? (
                    <div className="empty-results glass text-center" style={{ padding: '4rem 2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Aucun stage trouvé pour le moment</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem' }}>
                            Nous n'avons pas trouvé d'offres correspondant exactement à vos critères.
                            Essayez d'élargir votre recherche ou de réinitialiser les filtres pour voir toutes les opportunités disponibles.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setFilters({ field: '', type: '', search: '' })}
                        >
                            🔄 Voir toutes les offres
                        </button>
                    </div>
                ) : (
                    <div className="internships-grid">
                        {internships.map((internship) => (
                            <div key={internship._id} className="internship-card glass fadeIn">
                                <div className="card-top">
                                    <div className="company-info">
                                        <img
                                            src={internship.companyId?.logoUrl || 'https://via.placeholder.com/60'}
                                            alt={internship.companyId?.companyName}
                                            className="company-logo"
                                        />
                                        <div>
                                            <h3 className="internship-title">{internship.title}</h3>
                                            <p className="company-name">{internship.companyId?.companyName}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="tags">
                                        <span className="tag">{internship.field}</span>
                                        <span className="tag-outline">{internship.type}</span>
                                    </div>
                                    <p className="description-preview">
                                        {internship.description.substring(0, 120)}...
                                    </p>
                                </div>

                                <div className="card-footer">
                                    <div className="meta">
                                        <span title="Localisation">📍 {internship.location?.city || 'Tunis'}</span>
                                        <span title="Durée">📅 {internship.duration} mois</span>
                                    </div>
                                    <Link to={`/internships/${internship._id}`} className="btn btn-primary btn-sm">
                                        Voir Détails
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default InternshipsList;
