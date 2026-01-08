import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { generateAIDescription } from '../services/api';

const CreateInternship = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        field: 'Développement Web',
        type: 'Stage été',
        duration: 3,
        startDate: '',
        city: 'Tunis',
        description: '',
        requiredLevel: 'Licence 3',
        availableSpots: 1
    });

    const fields = [
        'Développement Web', 'Mobile', 'Data Science', 'Cybersécurité',
        'Design UI/UX', 'Marketing Digital', 'Finance', 'RH', 'Autre'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerateAI = async () => {
        if (!formData.title || !formData.field) {
            setError('Veuillez remplir le titre et le domaine pour générer avec l\'IA.');
            return;
        }
        setGenerating(true);
        setError('');
        try {
            const data = await generateAIDescription({
                title: formData.title,
                field: formData.field,
                duration: formData.duration
            });
            if (data.success) {
                setFormData({ ...formData, description: data.description });
            }
        } catch (err) {
            console.error('Erreur AI:', err);
            setError('La génération par IA a échoué. Réessayez plus tard.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/internships', {
                ...formData,
                location: { city: formData.city }
            });
            if (res.data.success) {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création de l\'offre.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-internship-page container fadeIn">
            <header className="page-header text-center">
                <h1>Publier une <span className="text-gradient">Offre</span></h1>
                <p>Attirez les meilleurs talents avec une description percutante.</p>
            </header>

            <div className="form-container glass">
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Titre du Stage</label>
                            <input
                                name="title"
                                type="text"
                                placeholder="Ex: Développeur Fullstack React/Node"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Domaine</label>
                            <select name="field" value={formData.field} onChange={handleChange}>
                                {fields.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Type de Stage</label>
                            <select name="type" value={formData.type} onChange={handleChange}>
                                <option value="Stage été">Stage été</option>
                                <option value="Stage PFE">Stage PFE</option>
                                <option value="Stage technique">Stage technique</option>
                                <option value="Stage ouvrier">Stage ouvrier</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Ville</label>
                            <input
                                name="city"
                                type="text"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Durée (mois)</label>
                            <input
                                name="duration"
                                type="number"
                                min="1" max="12"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Date de début</label>
                            <input
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group mt-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label>Description détaillée</label>
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={handleGenerateAI}
                                disabled={generating}
                            >
                                {generating ? '🪄 Génération...' : '✨ Générer avec l\'IA'}
                            </button>
                        </div>
                        <textarea
                            name="description"
                            rows="10"
                            placeholder="Missions, environnement technique, avantages..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-actions mt-5">
                        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                            {loading ? 'Publication...' : 'Publier le Stage'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInternship;
