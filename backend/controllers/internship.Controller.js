const Internship = require('../models/Internship');

// @desc    Créer un stage
// @route   POST /api/internships
// @access  Private (Company)
exports.createInternship = async (req, res) => {
    try {
        const {
            title, description, field, type, duration,
            startDate, location, requiredSkills, requiredLevel,
            salary, availableSpots, deadline
        } = req.body;

        if (!title || !description || !field || !type || !duration || !startDate) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez remplir tous les champs obligatoires'
            });
        }

        const internship = await Internship.create({
            companyId: req.user._id,
            title, description, field, type, duration,
            startDate, location, requiredSkills, requiredLevel,
            salary, availableSpots, deadline,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: 'Stage créé avec succès',
            data: internship
        });
    } catch (error) {
        console.error('❌ Erreur création stage:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir tous les stages
// @route   GET /api/internships
// @access  Public
exports.getAllInternships = async (req, res) => {
    try {
        let filter = { status: 'active' };

        if (req.query.field) filter.field = req.query.field;
        if (req.query.type) filter.type = req.query.type;
        if (req.query.city) filter['location.city'] = req.query.city;
        if (req.query.level) filter.requiredLevel = req.query.level;

        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const internships = await Internship.find(filter)
            .populate('companyId', 'companyName logoUrl industry website')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: internships.length,
            data: internships
        });
    } catch (error) {
        console.error('❌ Erreur récupération stages:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir un stage par ID
// @route   GET /api/internships/:id
// @access  Public
exports.getInternshipById = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id)
            .populate('companyId', 'companyName logoUrl industry description website phone address');

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Stage introuvable' });
        }

        res.status(200).json({ success: true, data: internship });
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'ID stage invalide' });
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir les stages d'une entreprise
// @route   GET /api/internships/company/:companyId
// @access  Public
exports.getCompanyInternships = async (req, res) => {
    try {
        const internships = await Internship.find({ companyId: req.params.companyId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: internships.length,
            data: internships
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Mettre à jour un stage
// @route   PUT /api/internships/:id
// @access  Private (Owner Company)
exports.updateInternship = async (req, res) => {
    try {
        let internship = await Internship.findById(req.params.id);

        if (!internship) return res.status(404).json({ success: false, message: 'Stage introuvable' });

        if (internship.companyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Stage mis à jour avec succès',
            data: internship
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Changer le statut d'un stage
// @route   PATCH /api/internships/:id/status
// @access  Private (Owner Company)
exports.updateInternshipStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['active', 'closed', 'filled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Statut invalide' });
        }

        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ success: false, message: 'Stage introuvable' });

        if (internship.companyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        internship.status = status;
        await internship.save();

        res.status(200).json({ success: true, message: `Statut changé en : ${status}`, data: internship });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Supprimer un stage
// @route   DELETE /api/internships/:id
// @access  Private (Owner Company)
exports.deleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ success: false, message: 'Stage introuvable' });

        if (internship.companyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        await Internship.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Stage supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir les statistiques des stages
// @route   GET /api/internships/stats/all
// @access  Public
exports.getInternshipStats = async (req, res) => {
    try {
        const totalInternships = await Internship.countDocuments();
        const activeInternships = await Internship.countDocuments({ status: 'active' });

        const byField = await Internship.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$field', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const byType = await Internship.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total: totalInternships,
                active: activeInternships,
                byField: byField,
                byType: byType
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};
