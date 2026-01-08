const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyToInternship,
  getMyApplications,
  getApplicationById,
  getInternshipApplications,
  updateApplicationStatus,
  updateApplication,
  withdrawApplication,
  getMyApplicationStats
} = require('../controllers/application.Controller');

// ========================================
// ROUTES
// ========================================

router.post('/', protect, authorize('student'), applyToInternship);
router.get('/my-applications', protect, authorize('student'), getMyApplications);
router.get('/stats/me', protect, authorize('student'), getMyApplicationStats);
router.get('/:id', protect, getApplicationById);
router.get('/internship/:internshipId', protect, authorize('company'), getInternshipApplications);
router.put('/:id/status', protect, authorize('company'), updateApplicationStatus);
router.put('/:id', protect, authorize('student'), updateApplication);
router.delete('/:id', protect, authorize('student'), withdrawApplication);

module.exports = router;