const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const Company = require('../models/Company');
const { protect, authorize } = require('../middleware/auth');

// ================================================================
// ROUTE 1 : CRÉER UN STAGE
// POST /api/internships
// Accès : Privé (entreprises uniquement)
// ================================================================
router.post('/', protect, authorize('company'), async (req, res) => {
  try {
    const {
      title,
      description,
      field,
      type,
      duration,
      startDate,
      location,
      requiredSkills,
      requiredLevel,
      salary,
      availableSpots,
      deadline
    } = req.body;

    // Validation des champs obligatoires
    if (!title || !description || !field || !type || !duration || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires (title, description, field, type, duration, startDate)'
      });
    }

    // Créer le stage
    const internship = await Internship.create({
      companyId: req.user._id,  // L'entreprise connectée
      title,
      description,
      field,
      type,
      duration,
      startDate,
      location,
      requiredSkills,
      requiredLevel,
      salary,
      availableSpots,
      deadline,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Stage créé avec succès',
      data: internship
    });
  } catch (error) {
    console.error('❌ Erreur création stage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du stage',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 2 : OBTENIR TOUS LES STAGES (avec filtres)
// GET /api/internships
// GET /api/internships?field=Web&city=Tunis&search=react
// Accès : Public
// ================================================================
router.get('/', async (req, res) => {
  try {
    // Construire les filtres depuis les query params
    let filter = { status: 'active' };  // Seulement les stages actifs

    // Filtrer par domaine
    if (req.query.field) {
      filter.field = req.query.field;
    }

    // Filtrer par type
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Filtrer par ville
    if (req.query.city) {
      filter['location.city'] = req.query.city;
    }

    // Filtrer par niveau requis
    if (req.query.level) {
      filter.requiredLevel = req.query.level;
    }

    // Recherche par mot-clé dans le titre ou description
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Récupérer les stages avec les infos de l'entreprise
    const internships = await Internship.find(filter)
      .populate('companyId', 'companyName logoUrl industry website')
      .sort({ createdAt: -1 });  // Les plus récents d'abord

    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships
    });
  } catch (error) {
    console.error('❌ Erreur récupération stages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 3 : OBTENIR UN STAGE PAR SON ID
// GET /api/internships/:id
// Accès : Public
// ================================================================
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('companyId', 'companyName logoUrl industry description website phone address');

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Stage introuvable'
      });
    }

    res.status(200).json({
      success: true,
      data: internship
    });
  } catch (error) {
    console.error('❌ Erreur récupération stage:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'ID stage invalide'
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
// ROUTE 4 : OBTENIR LES STAGES D'UNE ENTREPRISE
// GET /api/internships/company/:companyId
// Accès : Public
// ================================================================
router.get('/company/:companyId', async (req, res) => {
  try {
    const internships = await Internship.find({
      companyId: req.params.companyId
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships
    });
  } catch (error) {
    console.error('❌ Erreur récupération stages entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 5 : METTRE À JOUR UN STAGE
// PUT /api/internships/:id
// Accès : Privé (l'entreprise propriétaire)
// ================================================================
router.put('/:id', protect, authorize('company'), async (req, res) => {
  try {
    let internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Stage introuvable'
      });
    }

    // Vérifier que l'entreprise est bien propriétaire du stage
    if (internship.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres offres de stage'
      });
    }

    // Mettre à jour
    internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,           // Retourner le document mis à jour
        runValidators: true  // Exécuter les validations du schéma
      }
    );

    res.status(200).json({
      success: true,
      message: 'Stage mis à jour avec succès',
      data: internship
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour stage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 6 : CHANGER LE STATUT D'UN STAGE
// PATCH /api/internships/:id/status
// Accès : Privé (l'entreprise propriétaire)
// ================================================================
router.patch('/:id/status', protect, authorize('company'), async (req, res) => {
  try {
    const { status } = req.body;

    // Validation du statut
    const validStatuses = ['active', 'closed', 'filled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs possibles : ${validStatuses.join(', ')}`
      });
    }

    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Stage introuvable'
      });
    }

    // Vérifier propriété
    if (internship.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    internship.status = status;
    await internship.save();

    res.status(200).json({
      success: true,
      message: `Statut changé en : ${status}`,
      data: internship
    });
  } catch (error) {
    console.error('❌ Erreur changement statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 7 : SUPPRIMER UN STAGE
// DELETE /api/internships/:id
// Accès : Privé (l'entreprise propriétaire)
// ================================================================
router.delete('/:id', protect, authorize('company'), async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Stage introuvable'
      });
    }

    // Vérifier propriété
    if (internship.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres offres'
      });
    }

    await Internship.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Stage supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur suppression stage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 8 : OBTENIR LES STATISTIQUES DES STAGES
// GET /api/internships/stats/all
// Accès : Public
// ================================================================
router.get('/stats/all', async (req, res) => {
  try {
    const totalInternships = await Internship.countDocuments();
    const activeInternships = await Internship.countDocuments({ status: 'active' });
    
    // Statistiques par domaine
    const byField = await Internship.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$field', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Statistiques par type
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
    console.error('❌ Erreur statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

module.exports = router;