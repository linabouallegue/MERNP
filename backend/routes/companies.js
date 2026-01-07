const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { protect, authorize } = require('../middleware/auth');

// ================================================================
// ROUTE 1 : OBTENIR TOUTES LES ENTREPRISES
// GET /api/companies
// Accès : Public
// ================================================================
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().select('-password');

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    console.error('Erreur récupération entreprises:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 2 : OBTENIR UNE ENTREPRISE PAR SON ID
// GET /api/companies/:id
// Accès : Public
// ================================================================
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select('-password');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise introuvable'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Erreur récupération entreprise:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'ID entreprise invalide'
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
// ROUTE 3 : METTRE À JOUR UNE ENTREPRISE
// PUT /api/companies/:id
// Accès : Privé (l'entreprise elle-même)
// ================================================================
router.put('/:id', protect, authorize('company'), async (req, res) => {
  try {
    // Vérifier que l'entreprise modifie bien son propre profil
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que votre propre profil'
      });
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise introuvable'
      });
    }

    // Champs modifiables
    const {
      companyName,
      industry,
      description,
      address,
      phone,
      website,
      logoUrl,
      size,
      foundedYear
    } = req.body;

    // Mise à jour
    if (companyName) company.companyName = companyName;
    if (industry) company.industry = industry;
    if (description) company.description = description;
    if (address) company.address = address;
    if (phone) company.phone = phone;
    if (website) company.website = website;
    if (logoUrl) company.logoUrl = logoUrl;
    if (size) company.size = size;
    if (foundedYear) company.foundedYear = foundedYear;

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Profil entreprise mis à jour',
      data: company
    });
  } catch (error) {
    console.error('Erreur mise à jour entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ================================================================
// ROUTE 4 : SUPPRIMER UNE ENTREPRISE
// DELETE /api/companies/:id
// Accès : Privé (l'entreprise elle-même ou admin)
// ================================================================
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que votre propre compte'
      });
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise introuvable'
      });
    }

    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Compte entreprise supprimé'
    });
  } catch (error) {
    console.error('Erreur suppression entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

module.exports = router;