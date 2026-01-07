const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Student = require('../models/Student');
const Profile = require('../models/Profile');
const { protect, authorize } = require('../middleware/auth');

// ================================================================
// ROUTE 1 : POSTULER À UN STAGE
// POST /api/applications
// Accès : Privé (étudiants uniquement)
// ================================================================
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { internshipId, coverLetter, resumeUrl } = req.body;

    // ─────────────────────────────────────────────
    // VALIDATION DES DONNÉES
    // ─────────────────────────────────────────────
    if (!internshipId || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir l\'ID du stage et une lettre de motivation'
      });
    }

    // Vérifier longueur minimale de la lettre
    if (coverLetter.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'La lettre de motivation doit contenir au moins 50 caractères'
      });
    }

    // ─────────────────────────────────────────────
    // VÉRIFIER QUE LE STAGE EXISTE
    // ─────────────────────────────────────────────
    const internship = await Internship.findById(internshipId);
    
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Stage introuvable'
      });
    }

    // ─────────────────────────────────────────────
    // VÉRIFIER QUE LE STAGE EST ACTIF
    // ─────────────────────────────────────────────
    if (internship.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ce stage n\'accepte plus de candidatures'
      });
    }

    // ─────────────────────────────────────────────
    // VÉRIFIER LA DATE LIMITE
    // ─────────────────────────────────────────────
    if (internship.deadline && new Date() > new Date(internship.deadline)) {
      return res.status(400).json({
        success: false,
        message: 'La date limite de candidature est dépassée'
      });
    }

    // ─────────────────────────────────────────────
    // VÉRIFIER SI DÉJÀ POSTULÉ
    // ─────────────────────────────────────────────
    const existingApplication = await Application.findOne({
      studentId: req.user._id,
      internshipId: internshipId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà postulé à ce stage'
      });
    }

    // ─────────────────────────────────────────────
    // CRÉER LA CANDIDATURE
    // ─────────────────────────────────────────────
    const application = await Application.create({
      studentId: req.user._id,
      internshipId: internshipId,
      coverLetter: coverLetter,
      resumeUrl: resumeUrl || '',
      status: 'pending',
      appliedAt: new Date()
    });

    // ─────────────────────────────────────────────
    // RÉPONSE AVEC SUCCÈS
    // ─────────────────────────────────────────────
    res.status(201).json({
      success: true,
      message: 'Candidature envoyée avec succès ! L\'entreprise va examiner votre profil.',
      data: application
    });

  } catch (error) {
    console.error('❌ Erreur création candidature:', error);
    
    // Erreur de clé unique (doublon)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà postulé à ce stage'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi de la candidature',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 2 : OBTENIR TOUTES LES CANDIDATURES D'UN ÉTUDIANT
// GET /api/applications/my-applications
// Accès : Privé (étudiant connecté)
// ================================================================
router.get('/my-applications', protect, authorize('student'), async (req, res) => {
  try {
    // Récupérer les candidatures de l'étudiant connecté
    const applications = await Application.find({ 
      studentId: req.user._id 
    })
      .populate({
        path: 'internshipId',
        select: 'title type field duration startDate location status',
        populate: {
          path: 'companyId',
          select: 'companyName logoUrl industry'
        }
      })
      .sort({ appliedAt: -1 });  // Les plus récentes d'abord

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('❌ Erreur récupération candidatures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 3 : OBTENIR UNE CANDIDATURE SPÉCIFIQUE
// GET /api/applications/:id
// Accès : Privé (étudiant propriétaire ou entreprise)
// ================================================================
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'studentId',
        select: 'email'
      })
      .populate({
        path: 'internshipId',
        populate: {
          path: 'companyId',
          select: 'companyName logoUrl'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature introuvable'
      });
    }

    // Vérifier les permissions
    const isStudent = application.studentId._id.toString() === req.user._id.toString();
    const isCompany = application.internshipId.companyId._id.toString() === req.user._id.toString();

    if (!isStudent && !isCompany) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à voir cette candidature'
      });
    }

    // Si c'est l'étudiant, récupérer son profil
    if (isStudent) {
      const profile = await Profile.findOne({ studentId: application.studentId._id });
      application._doc.profile = profile;
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('❌ Erreur récupération candidature:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'ID candidature invalide'
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
// ROUTE 4 : OBTENIR TOUTES LES CANDIDATURES POUR UN STAGE
// GET /api/applications/internship/:internshipId
// Accès : Privé (entreprise propriétaire du stage uniquement)
// ================================================================
router.get('/internship/:internshipId', protect, authorize('company'), async (req, res) => {
  try {
    // ─────────────────────────────────────────────
    // VÉRIFIER QUE LE STAGE EXISTE
    // ─────────────────────────────────────────────
    const internship = await Internship.findById(req.params.internshipId);
    
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Stage introuvable'
      });
    }

    // ─────────────────────────────────────────────
    // VÉRIFIER QUE L'ENTREPRISE EST PROPRIÉTAIRE
    // ─────────────────────────────────────────────
    if (internship.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez voir que les candidatures de vos propres stages'
      });
    }

    // ─────────────────────────────────────────────
    // RÉCUPÉRER LES CANDIDATURES
    // ─────────────────────────────────────────────
    const applications = await Application.find({
      internshipId: req.params.internshipId
    })
      .populate('studentId', 'email isVerified')
      .sort({ appliedAt: -1 });

    // ─────────────────────────────────────────────
    // AJOUTER LES PROFILS DES ÉTUDIANTS
    // ─────────────────────────────────────────────
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const profile = await Profile.findOne({ 
          studentId: app.studentId._id 
        });
        
        return {
          ...app.toObject(),
          studentProfile: profile
        };
      })
    );

    // ─────────────────────────────────────────────
    // STATISTIQUES
    // ─────────────────────────────────────────────
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
      stats: stats,
      data: applicationsWithProfiles
    });

  } catch (error) {
    console.error('❌ Erreur récupération candidatures stage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 5 : METTRE À JOUR LE STATUT D'UNE CANDIDATURE
// PUT /api/applications/:id/status
// Accès : Privé (entreprise propriétaire du stage)
// ================================================================
router.put('/:id/status', protect, authorize('company'), async (req, res) => {
  try {
    const { status, companyMessage, companyNotes } = req.body;

    // ─────────────────────────────────────────────
    // VALIDATION DU STATUT
    // ─────────────────────────────────────────────
    const validStatuses = ['pending', 'reviewing', 'accepted', 'rejected'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs possibles : ${validStatuses.join(', ')}`
      });
    }

    // ─────────────────────────────────────────────
    // TROUVER LA CANDIDATURE
    // ─────────────────────────────────────────────
    const application = await Application.findById(req.params.id)
      .populate('internshipId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature introuvable'
      });
    }

    // ─────────────────────────────────────────────
    // VÉRIFIER LES PERMISSIONS
    // ─────────────────────────────────────────────
    if (application.internshipId.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette candidature'
      });
    }

    // ─────────────────────────────────────────────
    // METTRE À JOUR
    // ─────────────────────────────────────────────
    application.status = status;
    application.reviewedAt = new Date();
    
    if (companyMessage) {
      application.companyMessage = companyMessage;
    }
    
    if (companyNotes) {
      application.companyNotes = companyNotes;
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: `Statut mis à jour : ${status}`,
      data: application
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour candidature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 6 : MODIFIER UNE CANDIDATURE (Étudiant)
// PUT /api/applications/:id
// Accès : Privé (étudiant propriétaire, seulement si status='pending')
// ================================================================
router.put('/:id', protect, authorize('student'), async (req, res) => {
  try {
    const { coverLetter, resumeUrl } = req.body;

    // ─────────────────────────────────────────────
    // TROUVER LA CANDIDATURE
    // ─────────────────────────────────────────────
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature introuvable'
      });
    }

    // ─────────────────────────────────────────────
    // VÉRIFIER LES PERMISSIONS
    // ─────────────────────────────────────────────
    if (application.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres candidatures'
      });
    }

    // ─────────────────────────────────────────────
    // VÉRIFIER LE STATUT
    // ─────────────────────────────────────────────
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez modifier qu\'une candidature en attente'
      });
    }

    // ─────────────────────────────────────────────
    // METTRE À JOUR
    // ─────────────────────────────────────────────
    if (coverLetter) {
      if (coverLetter.length < 50) {
        return res.status(400).json({
          success: false,
          message: 'La lettre de motivation doit contenir au moins 50 caractères'
        });
      }
      application.coverLetter = coverLetter;
    }
    
    if (resumeUrl) {
      application.resumeUrl = resumeUrl;
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Candidature mise à jour avec succès',
      data: application
    });

  } catch (error) {
    console.error('❌ Erreur modification candidature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 7 : RETIRER UNE CANDIDATURE (Étudiant)
// DELETE /api/applications/:id
// Accès : Privé (étudiant propriétaire)
// ================================================================
router.delete('/:id', protect, authorize('student'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature introuvable'
      });
    }

    // ─────────────────────────────────────────────
    // VÉRIFIER LES PERMISSIONS
    // ─────────────────────────────────────────────
    if (application.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez retirer que vos propres candidatures'
      });
    }

    // ─────────────────────────────────────────────
    // MARQUER COMME RETIRÉE (plutôt que supprimer)
    // ─────────────────────────────────────────────
    application.status = 'withdrawn';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Candidature retirée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur retrait candidature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 8 : OBTENIR LES STATISTIQUES DE CANDIDATURES (Étudiant)
// GET /api/applications/stats/me
// Accès : Privé (étudiant connecté)
// ================================================================
router.get('/stats/me', protect, authorize('student'), async (req, res) => {
  try {
    const applications = await Application.find({ 
      studentId: req.user._id 
    });

    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewing: applications.filter(app => app.status === 'reviewing').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      withdrawn: applications.filter(app => app.status === 'withdrawn').length
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Erreur statistiques candidatures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

module.exports = router;