const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Profile = require('../models/Profile');

// ========================================
// FONCTION AUXILIAIRE : GÉNÉRER UN TOKEN
// ========================================
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Inscription Étudiant
// @route   POST /api/auth/register/student
// @access  Public
exports.registerStudent = async (req, res) => {
    try {
        console.log('📝 Tentative inscription étudiant:', req.body);
        const { email, password, fullName, phone } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires' });
        }

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Un compte existe déjà avec cet email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const student = await Student.create({
            email,
            password: hashedPassword,
            role: 'student'
        });

        const profile = await Profile.create({
            studentId: student._id,
            fullName,
            phone: phone || ''
        });

        const secret = process.env.JWT_SECRET || 'fallback_secret_dev_only';
        if (!process.env.JWT_SECRET) console.warn('⚠️ ATTENTION: JWT_SECRET manquant, utilisation du secret par défaut.');

        const token = jwt.sign(
            { id: student._id, role: student.role },
            secret,
            { expiresIn: '30d' }
        );

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
        console.error('❌ Erreur inscription étudiant:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription', error: error.message });
    }
};

// @desc    Inscription Entreprise
// @route   POST /api/auth/register/company
// @access  Public
exports.registerCompany = async (req, res) => {
    try {
        const { email, password, companyName, phone, industry } = req.body;

        if (!email || !password || !companyName) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires' });
        }

        const existingCompany = await Company.findOne({ email });
        if (existingCompany) {
            return res.status(400).json({ message: 'Un compte entreprise existe déjà avec cet email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const company = await Company.create({
            email,
            password: hashedPassword,
            companyName,
            phone: phone || '',
            industry: industry || 'Autre',
            role: 'company'
        });

        const secret = process.env.JWT_SECRET || 'fallback_secret_dev_only';
        if (!process.env.JWT_SECRET) console.warn('⚠️ ATTENTION: JWT_SECRET manquant, utilisation du secret par défaut.');

        const token = jwt.sign(
            { id: company._id, role: company.role },
            secret,
            { expiresIn: '30d' }
        );

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
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription', error: error.message });
    }
};

// @desc    Connexion Utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Veuillez fournir email et mot de passe' });
        }

        let user = await Student.findOne({ email });
        let role = 'student';

        if (!user) {
            user = await Company.findOne({ email });
            role = 'company';
        }

        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret_dev_only';
        if (!process.env.JWT_SECRET) console.warn('⚠️ ATTENTION: JWT_SECRET manquant, utilisation du secret par défaut.');

        const token = jwt.sign(
            { id: user._id, role: role },
            secret,
            { expiresIn: '30d' }
        );

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

        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion', error: error.message });
    }
};

// @desc    Obtenir l'utilisateur actuel
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        let userData = {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        };

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
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
