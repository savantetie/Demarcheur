const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  agence: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['basic', 'premium', 'elite'], required: true },
  statut: { type: String, enum: ['actif', 'expire', 'annule', 'en_attente'], default: 'en_attente' },
  dateDebut: { type: Date },
  dateFin: { type: Date },
  // Paiement simulé
  paiement: {
    methode: { type: String, enum: ['orange_money', 'mtn_money', 'virement', 'especes', 'simulation'], default: 'orange_money' },
    reference: { type: String },
    montant: { type: Number },
    numeroExpediteur: { type: String, default: '' },
    noteClient: { type: String, default: '' },
    dateReglement: { type: Date },
    confirme: { type: Boolean, default: false },
  },
  renouvellementAuto: { type: Boolean, default: false },
  historique: [{
    plan: String,
    dateDebut: Date,
    dateFin: Date,
    montant: Number,
  }],
}, { timestamps: true });

subscriptionSchema.index({ agence: 1, statut: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
