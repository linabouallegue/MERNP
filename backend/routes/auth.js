const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Profile = require('../models/Profile');

// ========================================
// FONCTION POUR GÉNÉRER UN TOKEN JWT
// ========================================
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },                    // Données encodées dans le token
    process.env.JWT_SECRET,          // Clé secrète
    { expiresIn: '30d' }             // Expire dans 30 jours
  );
};

// ========================================
// ROUTE : INSCRIPTION ÉTUDIANT
// POST /api/auth/register/student
// ========================================
router.post('/register/student', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // 1. Vérifier si tous les champs sont remplis
    if (!email || !password || !fullName) {
      return res.status(400).json({
        message: 'Veuillez remplir tous les champs obligatoires'
      });
    }

    // 2. Vérifier si l'étudiant existe déjà
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        message: 'Un compte existe déjà avec cet email'
      });
    }

    // 3. Hasher (crypter) le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Créer l'étudiant
    const student = await Student.create({
      email,
      password: hashedPassword,
      role: 'student'
    });

    // 5. Créer le profil associé (relation 1-to-1)
    const profile = await Profile.create({
      studentId: student._id,
      fullName,
      phone: phone || ''
    });

    // 6. Générer le token JWT
    const token = generateToken(student._id, student.role);

    // 7. Répondre avec succès
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: student._id,
        email: student.email,
        role: student.role,
        profile: {
          fullName: profile.fullName,
          phone: profile.phone
        }
      }
    });
  } catch (error) {
    console.error('Erreur inscription étudiant:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de l\'inscription',
      error: error.message
    });
  }
});

// ========================================
// ROUTE : INSCRIPTION ENTREPRISE
// POST /api/auth/register/company
// ========================================
router.post('/register/company', async (req, res) => {
  try {
    const { email, password, companyName, phone, industry } = req.body;

    // Validation
    if (!email || !password || !companyName) {
      return res.status(400).json({
        message: 'Veuillez remplir tous les champs obligatoires'
      });
    }

    // Vérifier si l'entreprise existe déjà
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({
        message: 'Un compte entreprise existe déjà avec cet email'
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'entreprise
    const company = await Company.create({
      email,
      password: hashedPassword,
      companyName,
      phone: phone || '',
      industry: industry || 'Autre',
      role: 'company'
    });

    // Générer le token
    const token = generateToken(company._id, company.role);

    // Réponse
    res.status(201).json({
      success: true,
      message: 'Inscription entreprise réussie',
      token,
      user: {
        id: company._id,
        email: company.email,
        role: company.role,
        companyName: company.companyName
      }
    });
  } catch (error) {
    console.error('Erreur inscription entreprise:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de l\'inscription',
      error: error.message
    });
  }
});

// ========================================
// ROUTE : CONNEXION (Login)
// POST /api/auth/login
// ========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Veuillez fournir email et mot de passe'
      });
    }

    // 2. Chercher l'utilisateur (étudiant ou entreprise)
    let user = await Student.findOne({ email });
    let role = 'student';

    if (!user) {
      user = await Company.findOne({ email });
      role = 'company';
    }

    if (!user) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // 3. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // 4. Générer le token
    const token = generateToken(user._id, role);

    // 5. Récupérer les infos selon le rôle
    let userData = {
      id: user._id,
      email: user.email,
      role: role
    };

    if (role === 'student') {
      const profile = await Profile.findOne({ studentId: user._id });
      userData.profile = profile;
    } else {
      userData.companyName = user.companyName;
    }

    // 6. Réponse avec succès
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la connexion',
      error: error.message
    });
  }
});

// ========================================
// ROUTE : OBTENIR L'UTILISATEUR CONNECTÉ
// GET /api/auth/me
// (Route protégée - nécessite un token)
// ========================================
const { protect } = require('../middleware/auth');

router.get('/me', protect, async (req, res) => {
  try {
    // req.user est déjà défini par le middleware protect
    let userData = {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    };

    // Si c'est un étudiant, récupérer son profil
    if (req.user.role === 'student') {
      const profile = await Profile.findOne({ studentId: req.user._id });
      userData.profile = profile;
    } else {
      userData.companyName = req.user.companyName;
    }

    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

module.exports = router;