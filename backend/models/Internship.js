const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  // RELATION 1-to-Many : Une entreprise peut avoir plusieurs stages
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',         // Référence au modèle Company
    required: true
  },
  
  // Titre du stage
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Description
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Domaine
  field: {
    type: String,
    enum: [
      'Développement Web',
      'Mobile',
      'Data Science',
      'Cybersécurité',
      'Design UI/UX',
      'Marketing Digital',
      'Finance',
      'RH',
      'Autre'
    ],
    required: true
  },
  
  // Type de stage
  type: {
    type: String,
    enum: ['Stage été', 'Stage PFE', 'Stage ouvrier', 'Stage technique'],
    required: true
  },
  
  // Durée en mois
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  
  // Date de début
  startDate: {
    type: Date,
    required: true
  },
  
  // Lieu
  location: {
    city: String,
    governorate: String,
    remote: {
      type: Boolean,
      default: false
    }
  },
  
  // Compétences requises
  requiredSkills: [{
    type: String
  }],
  
  // Niveau requis
  requiredLevel: {
    type: String,
    enum: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Ingénieur']
  },
  
  // Rémunération (optionnel)
  salary: {
    amount: Number,
    currency: {
      type: String,
      default: 'TND'
    },
    isPaid: {
      type: Boolean,
      default: false
    }
  },
  
  // Nombre de places disponibles
  availableSpots: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Statut de l'offre
  status: {
    type: String,
    enum: ['active', 'closed', 'filled'],
    default: 'active'
  },
  
  // Date limite de candidature
  deadline: {
    type: Date
  }
}, {
  timestamps: true
});

const Internship = mongoose.model('Internship', internshipSchema);
module.exports = Internship;