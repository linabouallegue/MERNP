const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require('../controllers/company.Controller');

// ========================================
// ROUTES
// ========================================

router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', protect, authorize('company'), updateCompany);
router.delete('/:id', protect, deleteCompany);

module.exports = router;