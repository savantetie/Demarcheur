const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  annonceur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre: { type: String, required: true },
  imageUrl: { type: String },
  lienCible: { type: String },
  emplacement: {
    type: String,
    enum: ['homepage_top', 'homepage_mid', 'resultats', 'detail'],
    required: true,
  },
  statut: { type: String, enum: ['actif', 'inactif', 'expire'], default: 'inactif' },
  dateDebut: { type: Date },
  dateFin: { type: Date },
  budget: { type: Number, default: 0 }, // GNF
  impressions: { type: Number, default: 0 },
  clics: { type: Number, default: 0 },
}, { timestamps: true });

adSchema.index({ emplacement: 1, statut: 1 });

module.exports = mongoose.model('Ad', adSchema);
