const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  titre: { type: String, required: true, trim: true },
  type: {
    type: String,
    required: true,
    enum: ['location', 'vente-maison', 'terrain'],
  },
  prix: { type: Number, required: true },
  quartier: { type: String, required: true, trim: true },
  ville: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  photos: [
    {
      url: String,
      public_id: String,
    },
  ],
  statut: {
    type: String,
    enum: ['en_attente', 'publie', 'loue', 'vendu', 'rejete'],
    default: 'en_attente',
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  telephone: { type: String },
  whatsapp: { type: String },
}, { timestamps: true });

// Index pour la recherche/filtrage
listingSchema.index({ ville: 1, type: 1, statut: 1 });
listingSchema.index({ prix: 1 });

module.exports = mongoose.model('Listing', listingSchema);
