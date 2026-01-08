const Company = require('../models/Company');

// @desc    Obtenir toutes les entreprises
// @route   GET /api/companies
// @access  Public
exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find().select('-password');
        res.status(200).json({ success: true, count: companies.length, data: companies });
    } catch (error) {
        console.error('Erreur récupération entreprises:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir une entreprise par ID
// @route   GET /api/companies/:id
// @access  Public
exports.getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).select('-password');
        if (!company) return res.status(404).json({ success: false, message: 'Entreprise introuvable' });
        res.status(200).json({ success: true, data: company });
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'ID entreprise invalide' });
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Mettre à jour une entreprise
// @route   PUT /api/companies/:id
// @access  Private (Owner Company)
exports.updateCompany = async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ success: false, message: 'Entreprise introuvable' });

        const fieldsToUpdate = [
            'companyName', 'industry', 'description', 'address',
            'phone', 'website', 'logoUrl', 'size', 'foundedYear'
        ];

        fieldsToUpdate.forEach(field => {
            if (req.body[field]) company[field] = req.body[field];
        });

        await company.save();

        res.status(200).json({ success: true, message: 'Profil mis à jour', data: company });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Supprimer une entreprise
// @route   DELETE /api/companies/:id
// @access  Private (Owner/Admin)
exports.deleteCompany = async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ success: false, message: 'Entreprise introuvable' });

        await Company.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Compte supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};
