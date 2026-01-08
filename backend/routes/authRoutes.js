const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerStudent,
  registerCompany,
  login,
  getMe
} = require('../controllers/auth.Controller');

// ========================================
// ROUTES
// ========================================

router.post('/register/student', registerStudent);
router.post('/register/company', registerCompany);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;