const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllStudents,
  getStudentById,
  updateStudentProfile,
  deleteStudent
} = require('../controllers/student.Controller');

// ========================================
// ROUTES
// ========================================

router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.put('/:id/profile', protect, updateStudentProfile);
router.delete('/:id', protect, deleteStudent);

module.exports = router;