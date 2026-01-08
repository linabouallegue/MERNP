const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createInternship,
  getAllInternships,
  getInternshipById,
  getCompanyInternships,
  updateInternship,
  updateInternshipStatus,
  deleteInternship,
  getInternshipStats
} = require('../controllers/internship.Controller');

// ========================================
// ROUTES
// ========================================

router.post('/', protect, authorize('company'), createInternship);
router.get('/', getAllInternships);
router.get('/stats/all', getInternshipStats);
router.get('/:id', getInternshipById);
router.get('/company/:companyId', getCompanyInternships);
router.put('/:id', protect, authorize('company'), updateInternship);
router.patch('/:id/status', protect, authorize('company'), updateInternshipStatus);
router.delete('/:id', protect, authorize('company'), deleteInternship);

module.exports = router;