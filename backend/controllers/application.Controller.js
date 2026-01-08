const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Profile = require('../models/Profile');

// @desc    Postuler à un stage
// @route   POST /api/applications
// @access  Private (Student)
exports.applyToInternship = async (req, res) => {
    try {
        const { internshipId, coverLetter, resumeUrl } = req.body;

        if (!internshipId || !coverLetter) {
            return res.status(400).json({ success: false, message: 'Veuillez fournir l\'ID du stage et une lettre de motivation' });
        }

        if (coverLetter.length < 50) {
            return res.status(400).json({ success: false, message: 'La lettre de motivation doit contenir au moins 50 caractères' });
        }

        const internship = await Internship.findById(internshipId);
        if (!internship) return res.status(404).json({ success: false, message: 'Stage introuvable' });

        if (internship.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Ce stage n\'accepte plus de candidatures' });
        }

        if (internship.deadline && new Date() > new Date(internship.deadline)) {
            return res.status(400).json({ success: false, message: 'La date limite de candidature est dépassée' });
        }

        const existingApplication = await Application.findOne({ studentId: req.user._id, internshipId });
        if (existingApplication) {
            return res.status(400).json({ success: false, message: 'Vous avez déjà postulé à ce stage' });
        }

        const application = await Application.create({
            studentId: req.user._id,
            internshipId,
            coverLetter,
            resumeUrl: resumeUrl || '',
            status: 'pending',
            appliedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Candidature envoyée avec succès !',
            data: application
        });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Vous avez déjà postulé à ce stage' });
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir mes candidatures
// @route   GET /api/applications/my-applications
// @access  Private (Student)
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.user._id })
            .populate({
                path: 'internshipId',
                select: 'title type field duration startDate location status',
                populate: { path: 'companyId', select: 'companyName logoUrl industry' }
            })
            .sort({ appliedAt: -1 });

        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir une candidature par ID
// @route   GET /api/applications/:id
// @access  Private (Student/Company)
exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate({ path: 'studentId', select: 'email' })
            .populate({
                path: 'internshipId',
                populate: { path: 'companyId', select: 'companyName logoUrl' }
            });

        if (!application) return res.status(404).json({ success: false, message: 'Candidature introuvable' });

        const isStudent = application.studentId._id.toString() === req.user._id.toString();
        const isCompany = application.internshipId.companyId._id.toString() === req.user._id.toString();

        if (!isStudent && !isCompany) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        if (isStudent) {
            const profile = await Profile.findOne({ studentId: application.studentId._id });
            application._doc.profile = profile;
        }

        res.status(200).json({ success: true, data: application });
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'ID invalide' });
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir les candidatures d'un stage
// @route   GET /api/applications/internship/:internshipId
// @access  Private (Company)
exports.getInternshipApplications = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.internshipId);
        if (!internship) return res.status(404).json({ success: false, message: 'Stage introuvable' });

        if (internship.companyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const applications = await Application.find({ internshipId: req.params.internshipId })
            .populate('studentId', 'email isVerified')
            .sort({ appliedAt: -1 });

        const applicationsWithProfiles = await Promise.all(
            applications.map(async (app) => {
                const profile = await Profile.findOne({ studentId: app.studentId._id });
                return { ...app.toObject(), studentProfile: profile };
            })
        );

        const stats = {
            total: applications.length,
            pending: applications.filter(app => app.status === 'pending').length,
            reviewing: applications.filter(app => app.status === 'reviewing').length,
            accepted: applications.filter(app => app.status === 'accepted').length,
            rejected: applications.filter(app => app.status === 'rejected').length
        };

        res.status(200).json({
            success: true,
            count: applicationsWithProfiles.length,
            stats,
            data: applicationsWithProfiles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Mettre à jour le statut
// @route   PUT /api/applications/:id/status
// @access  Private (Company)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status, companyMessage, companyNotes } = req.body;
        const validStatuses = ['pending', 'reviewing', 'accepted', 'rejected'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Statut invalide' });
        }

        const application = await Application.findById(req.params.id).populate('internshipId');
        if (!application) return res.status(404).json({ success: false, message: 'Candidature introuvable' });

        if (application.internshipId.companyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        application.status = status;
        application.reviewedAt = new Date();
        if (companyMessage) application.companyMessage = companyMessage;
        if (companyNotes) application.companyNotes = companyNotes;

        await application.save();

        res.status(200).json({ success: true, message: `Statut mis à jour : ${status}`, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Modifier une candidature
// @route   PUT /api/applications/:id
// @access  Private (Student)
exports.updateApplication = async (req, res) => {
    try {
        const { coverLetter, resumeUrl } = req.body;
        const application = await Application.findById(req.params.id);

        if (!application) return res.status(404).json({ success: false, message: 'Candidature introuvable' });

        if (application.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Modification impossible (non pending)' });
        }

        if (coverLetter) {
            if (coverLetter.length < 50) return res.status(400).json({ success: false, message: 'Lettre trop courte' });
            application.coverLetter = coverLetter;
        }
        if (resumeUrl) application.resumeUrl = resumeUrl;

        await application.save();
        res.status(200).json({ success: true, message: 'Candidature mise à jour', data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Retirer une candidature
// @route   DELETE /api/applications/:id
// @access  Private (Student)
exports.withdrawApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ success: false, message: 'Candidature introuvable' });

        if (application.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        application.status = 'withdrawn';
        await application.save();

        res.status(200).json({ success: true, message: 'Candidature retirée' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Statistiques candidatures étudiant
// @route   GET /api/applications/stats/me
// @access  Private (Student)
exports.getMyApplicationStats = async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.user._id });
        const stats = {
            total: applications.length,
            pending: applications.filter(app => app.status === 'pending').length,
            reviewing: applications.filter(app => app.status === 'reviewing').length,
            accepted: applications.filter(app => app.status === 'accepted').length,
            rejected: applications.filter(app => app.status === 'rejected').length,
            withdrawn: applications.filter(app => app.status === 'withdrawn').length
        };
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};
