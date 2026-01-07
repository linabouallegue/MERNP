const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Informations de connexion
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Rôle
  role: {
    type: String,
    default: 'company'
  },
  
  // Nom de l'entreprise
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Secteur d'activité
  industry: {
    type: String,
    enum: [
      'Technologie',
      'Finance',
      'Santé',
      'Éducation',
      'Commerce',
      'Industrie',
      'Services',
      'Autre'
    ]
  },
  
  // Description de l'entreprise
  description: {
    type: String,
    maxlength: 1000
  },
  
  // Adresse
  address: {
    street: String,
    city: String,
    governorate: String,
    postalCode: String
  },
  
  // Téléphone
  phone: {
    type: String
  },
  
  // Site web
  website: {
    type: String
  },
  
  // Logo de l'entreprise
  logoUrl: {
    type: String,
    default: 'https://via.placeholder.com/200'
  },
  
  // Taille de l'entreprise
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+']
  },
  
  // Année de création
  foundedYear: {
    type: Number
  },
  
  // Est vérifiée ?
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;