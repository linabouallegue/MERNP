const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté avec succès'))
  .catch((err) => console.error('❌ Erreur MongoDB:', err));

// ═══════════════════════════════════════════════════
// IMPORTER TOUTES LES ROUTES
// ═══════════════════════════════════════════════════
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const companyRoutes = require('./routes/companyRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const aiRoutes = require('./routes/aiRoutes');

// ═══════════════════════════════════════════════════
// UTILISER LES ROUTES
// ═══════════════════════════════════════════════════
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);

// ═══════════════════════════════════════════════════
// ROUTE RACINE : DOCUMENTATION API
// ═══════════════════════════════════════════════════
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Plateforme de Gestion de Stages',
    version: '1.0.0',
    documentation: {
      auth: {
        register_student: 'POST /api/auth/register/student',
        register_company: 'POST /api/auth/register/company',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (protégé)'
      },
      students: {
        getAll: 'GET /api/students',
        getOne: 'GET /api/students/:id',
        updateProfile: 'PUT /api/students/:id/profile (protégé)',
        delete: 'DELETE /api/students/:id (protégé)'
      },
      companies: {
        getAll: 'GET /api/companies',
        getOne: 'GET /api/companies/:id',
        update: 'PUT /api/companies/:id (protégé)',
        delete: 'DELETE /api/companies/:id (protégé)'
      },
      internships: {
        create: 'POST /api/internships (company only)',
        getAll: 'GET /api/internships',
        getOne: 'GET /api/internships/:id',
        update: 'PUT /api/internships/:id (company only)',
        delete: 'DELETE /api/internships/:id (company only)',
        getByCompany: 'GET /api/internships/company/:companyId'
      },
      applications: {
        apply: 'POST /api/applications (student only)',
        myApplications: 'GET /api/applications/my-applications (student)',
        getOne: 'GET /api/applications/:id',
        getByInternship: 'GET /api/applications/internship/:internshipId (company)',
        updateStatus: 'PUT /api/applications/:id/status (company)',
        update: 'PUT /api/applications/:id (student)',
        withdraw: 'DELETE /api/applications/:id (student)',
        myStats: 'GET /api/applications/stats/me (student)'
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
