const Student = require('../models/Student');
const Profile = require('../models/Profile');

// @desc    Obtenir tous les étudiants
// @route   GET /api/students
// @access  Public
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password');

        const studentsWithProfiles = await Promise.all(
            students.map(async (student) => {
                const profile = await Profile.findOne({ studentId: student._id });
                return { ...student.toObject(), profile: profile };
            })
        );

        res.status(200).json({ success: true, count: studentsWithProfiles.length, data: studentsWithProfiles });
    } catch (error) {
        console.error('Erreur récupération étudiants:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir un étudiant par ID
// @route   GET /api/students/:id
// @access  Public
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-password');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Étudiant introuvable' });
        }

        const profile = await Profile.findOne({ studentId: student._id });

        res.status(200).json({ success: true, data: { ...student.toObject(), profile: profile } });
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'ID étudiant invalide' });
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/students/:id/profile
// @access  Private (Owner/Student)
exports.updateStudentProfile = async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        let profile = await Profile.findOne({ studentId: req.params.id });
        if (!profile) return res.status(404).json({ success: false, message: 'Profil introuvable' });

        const fieldsToUpdate = [
            'fullName', 'phone', 'dateOfBirth', 'address', 'education',
            'skills', 'languages', 'resumeUrl', 'avatarUrl', 'bio', 'socialLinks'
        ];

        fieldsToUpdate.forEach(field => {
            if (req.body[field]) profile[field] = req.body[field];
        });

        await profile.save();

        res.status(200).json({ success: true, message: 'Profil mis à jour', data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Supprimer un étudiant
// @route   DELETE /api/students/:id
// @access  Private (Owner/Admin)
exports.deleteStudent = async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ success: false, message: 'Étudiant introuvable' });

        await Profile.findOneAndDelete({ studentId: req.params.id });
        await Student.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Compte supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};
