const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  // RELATION 1-to-1 avec Student
  studentId: {
    type: mongoose.Schema.Types.ObjectId,   // Type spécial MongoDB (ID)
    ref: 'Student',                         // Référence au modèle Student
    required: true,
    unique: true                            // Un étudiant = Un seul profil
  },
  
  // Nom complet
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Téléphone
  phone: {
    type: String,
    trim: true
  },
  
  // Date de naissance
  dateOfBirth: {
    type: Date
  },
  
  // Adresse
  address: {
    street: String,
    city: String,
    governorate: String,    // Gouvernorat (Tunisie)
    postalCode: String
  },
  
  // Éducation
  education: {
    university: String,
    faculty: String,
    major: String,          // Spécialité
    level: {
      type: String,
      enum: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Ingénieur']
    },
    graduationYear: Number
  },
  
  // Compétences (tableau de textes)
  skills: [{
    type: String
  }],
  
  // Langues parlées
  languages: [{
    language: String,
    level: {
      type: String,
      enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Courant', 'Langue maternelle']
    }
  }],
  
  // CV (lien vers le fichier)
  resumeUrl: {
    type: String
  },
  
  // Photo de profil
  avatarUrl: {
    type: String,
    default: 'https://via.placeholder.com/150'  // Image par défaut
  },
  
  // Biographie
  bio: {
    type: String,
    maxlength: 500          // Maximum 500 caractères
  },
  
  // Réseaux sociaux
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String
  }
}, {
  timestamps: true
});

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;