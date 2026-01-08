import React, { useState, useEffect } from 'react';
import api, { getMyApplications } from '../services/api';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const data = await getMyApplications();
            if (data.success) {
                setApplications(data.data);
            }
        } catch (err) {
            console.error('Erreur chargement candidatures:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner container"><div className="spinner"></div></div>;

    return (
        <div className="container mt-5 fadeIn">
            <h1 className="mb-4">Mes <span className="text-gradient">Candidatures</span></h1>

            {applications.length === 0 ? (
                <div className="glass p-5 text-center">
                    <p>Vous n'avez pas encore postulé à des offres.</p>
                </div>
            ) : (
                <div className="applications-list">
                    {applications.map(app => (
                        <div key={app._id} className="glass p-4 mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3>{app.internshipId?.title || 'Stage inconnu'}</h3>
                                <p className="text-muted">Postulé le {new Date(app.appliedAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`badge ${app.status === 'accepted' ? 'bg-success' : app.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                                {app.status.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;
