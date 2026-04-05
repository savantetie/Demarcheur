const mongoose = require('mongoose');

/**
 * Alerte immobilière : l'utilisateur est notifié quand une annonce
 * correspond à ses critères.
 */
const alertSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nom: { type: String, required: true, trim: true }, // ex: "Villa Conakry moins de 5M"
  criteres: {
    type: { type: String, enum: ['location', 'vente-maison', 'terrain', ''] },
    ville: { type: String },
    quartier: { type: String },
    prixMin: { type: Number },
    prixMax: { type: Number },
  },
  active: { type: Boolean, default: true },
  dernierEnvoi: { type: Date },
}, { timestamps: true });

alertSchema.index({ utilisateur: 1 });

module.exports = mongoose.model('Alert', alertSchema);
