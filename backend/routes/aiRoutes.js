const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    generateInternshipDescription,
    optimizeCoverLetter,
    chatWithAI
} = require('../controllers/ai.Controller');

// ========================================
// ROUTES
// ========================================

router.post('/generate-description', protect, generateInternshipDescription);
router.post('/optimize-cover-letter', protect, optimizeCoverLetter);
router.post('/chat', protect, chatWithAI);

module.exports = router;
