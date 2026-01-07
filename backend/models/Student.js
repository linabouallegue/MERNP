const mongoose = require('mongoose');

// Définir le schéma (la structure) de l'étudiant
const studentSchema = new mongoose.Schema({
  // Email de l'étudiant
  email: {
    type: String,           // Type de données : texte
    required: true,         // Obligatoire
    unique: true,           // Doit être unique (pas de doublons)
    lowercase: true,        // Convertit en minuscules
    trim: true              // Enlève les espaces avant/après
  },
  
  // Mot de passe (sera crypté)
  password: {
    type: String,
    required: true,
    minlength: 6            // Minimum 6 caractères
  },
  
  // Rôle de l'utilisateur
  role: {
    type: String,
    enum: ['student', 'company', 'admin'],  // Valeurs possibles
    default: 'student'                       // Valeur par défaut
  },
  
  // Est-ce que l'email est vérifié ?
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Date de création du compte
  createdAt: {
    type: Date,
    default: Date.now       // Automatiquement la date actuelle
  }
}, {
  timestamps: true          // Ajoute automatiquement createdAt et updatedAt
});

// Créer le modèle à partir du schéma
const Student = mongoose.model('Student', studentSchema);

// Exporter pour l'utiliser ailleurs
module.exports = Student;