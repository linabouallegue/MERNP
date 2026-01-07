const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Profile = require('../models/Profile');
const { protect, authorize } = require('../middleware/auth');

// ================================================================
// ROUTE 1 : OBTENIR TOUS LES ÉTUDIANTS
// GET /api/students
// Accès : Public (ou admin seulement selon vos besoins)
// ================================================================
router.get('/', async (req, res) => {
  try {
    // Récupérer tous les étudiants SANS leurs mots de passe
    const students = await Student.find().select('-password');
    
    // Pour chaque étudiant, récupérer son profil
    const studentsWithProfiles = await Promise.all(
      students.map(async (student) => {
        const profile = await Profile.findOne({ studentId: student._id });
        return {
          ...student.toObject(),  // Convertir en objet JavaScript
          profile: profile
        };
      })
    );

    res.status(200).json({
      success: true,
      count: studentsWithProfiles.length,
      data: studentsWithProfiles
    });
  } catch (error) {
    console.error('Erreur récupération étudiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 2 : OBTENIR UN ÉTUDIANT PAR SON ID
// GET /api/students/:id
// Accès : Public
// ================================================================
router.get('/:id', async (req, res) => {
  try {
    // req.params.id → L'ID dans l'URL
    const student = await Student.findById(req.params.id).select('-password');
    
    // Si l'étudiant n'existe pas
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant introuvable'
      });
    }

    // Récupérer son profil
    const profile = await Profile.findOne({ studentId: student._id });

    res.status(200).json({
      success: true,
      data: {
        ...student.toObject(),
        profile: profile
      }
    });
  } catch (error) {
    console.error('Erreur récupération étudiant:', error);
    
    // Si l'ID n'est pas valide (format MongoDB)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'ID étudiant invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 3 : METTRE À JOUR LE PROFIL D'UN ÉTUDIANT
// PUT /api/students/:id/profile
// Accès : Privé (l'étudiant lui-même uniquement)
// ================================================================
router.put('/:id/profile', protect, async (req, res) => {
  try {
    // Vérifier que l'utilisateur modifie bien SON propre profil
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que votre propre profil'
      });
    }

    // Trouver le profil de l'étudiant
    let profile = await Profile.findOne({ studentId: req.params.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profil introuvable'
      });
    }

    // Champs modifiables du profil
    const {
      fullName,
      phone,
      dateOfBirth,
      address,
      education,
      skills,
      languages,
      resumeUrl,
      avatarUrl,
      bio,
      socialLinks
    } = req.body;

    // Mettre à jour uniquement les champs fournis
    if (fullName) profile.fullName = fullName;
    if (phone) profile.phone = phone;
    if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
    if (address) profile.address = address;
    if (education) profile.education = education;
    if (skills) profile.skills = skills;
    if (languages) profile.languages = languages;
    if (resumeUrl) profile.resumeUrl = resumeUrl;
    if (avatarUrl) profile.avatarUrl = avatarUrl;
    if (bio) profile.bio = bio;
    if (socialLinks) profile.socialLinks = socialLinks;

    // Sauvegarder les modifications
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: profile
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 4 : SUPPRIMER UN ÉTUDIANT
// DELETE /api/students/:id
// Accès : Privé (l'étudiant lui-même ou admin)
// ================================================================
router.delete('/:id', protect, async (req, res) => {
  try {
    // Vérifier les permissions
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que votre propre compte'
      });
    }

    // Trouver l'étudiant
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant introuvable'
      });
    }

    // Supprimer le profil associé
    await Profile.findOneAndDelete({ studentId: req.params.id });

    // Supprimer l'étudiant
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Compte étudiant supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

module.exports = router; 