const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // RELATION Many-to-Many
  // Un étudiant peut postuler à plusieurs stages
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Un stage peut recevoir plusieurs candidatures
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  
  // Lettre de motivation
  coverLetter: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // CV spécifique pour cette candidature
  resumeUrl: {
    type: String
  },
  
  // Statut de la candidature
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  // Date de soumission
  appliedAt: {
    type: Date,
    default: Date.now
  },
  
  // Date de révision par l'entreprise
  reviewedAt: {
    type: Date
  },
  
  // Notes de l'entreprise (privées)
  companyNotes: {
    type: String,
    maxlength: 500
  },
  
  // Message de l'entreprise (visible par l'étudiant)
  companyMessage: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index pour éviter les doublons (un étudiant ne peut postuler qu'une fois au même stage)
applicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;