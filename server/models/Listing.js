const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  // ── Identité ──────────────────────────────────────────
  titre: { type: String, required: true, trim: true },
  type: {
    type: String,
    required: true,
    enum: ['location', 'vente-maison', 'terrain'],
  },
  typeLogement: {
    type: String,
    enum: ['villa', 'appartement', 'maison', 'duplex', 'studio', 'chambre', 'immeuble', null],
    default: null,
  },

  // ── Localisation ──────────────────────────────────────
  ville: { type: String, required: true, trim: true },
  commune: { type: String, trim: true, default: '' },   // ex: Ratoma, Matoto (Conakry)
  quartier: { type: String, required: true, trim: true },
  repere: { type: String, trim: true, default: '' },    // ex: "Près de la mosquée centrale"

  // ── Superficie & Structure ─────────────────────────────
  surface: { type: Number, default: null },             // m² habitable
  surfaceTerrain: { type: Number, default: null },      // m² terrain/parcelle
  nbChambres: { type: Number, default: null },
  nbPieces: { type: Number, default: null },            // pièces totales
  nbSDB: { type: Number, default: null },               // salles de bain / douches
  etage: { type: String, default: '' },                 // RDC, 1er, 2ème...
  etat: {
    type: String,
    enum: ['neuf', 'bon-etat', 'a-renover', 'inacheve', null],
    default: null,
  },

  // ── Terrain spécifique ─────────────────────────────────
  titreFoncier: {
    type: String,
    enum: ['tf', 'pf', 'lettre-attribution', 'acte-vente', 'non-titre', null],
    default: null,
  },

  // ── Équipements & Commodités ───────────────────────────
  equipements: [{ type: String }],  // liste libre: 'edg','seg','groupe','citerne','fosse','puits','clim','cloture','portail','gardien','terrasse','cuisine'

  // ── Prix & Conditions ─────────────────────────────────
  prix: { type: Number, required: true },
  negotiable: { type: Boolean, default: false },
  caution: { type: Number, default: 0 },               // nb de mois de caution (location)
  chargesIncluses: { type: Boolean, default: false },
  disponibilite: { type: String, default: 'immediate' }, // 'immediate' ou date

  // ── Contact ──────────────────────────────────────────
  telephone: { type: String },
  whatsapp: { type: String },

  // ── Infos agence ─────────────────────────────────────
  refInterne: { type: String, default: '' },
  typeMandat: {
    type: String,
    enum: ['simple', 'exclusif', null],
    default: null,
  },

  // ── Médias ───────────────────────────────────────────
  photos: [{ url: String, public_id: String }],
  description: { type: String, required: true },

  // ── Statut & Propriétaire ─────────────────────────────
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

  // ── Boost / Featured ─────────────────────────────────
  featured: { type: Boolean, default: false },
  featuredType: { type: String, enum: ['top', 'premium', 'sponsorise', null], default: null },
  featuredExpiry: { type: Date },

  // ── Statistiques ─────────────────────────────────────
  vues: { type: Number, default: 0 },
  contactsRecus: { type: Number, default: 0 },

}, { timestamps: true });

listingSchema.index({ ville: 1, type: 1, statut: 1 });
listingSchema.index({ prix: 1 });
listingSchema.index({ featured: 1, statut: 1 });

module.exports = mongoose.model('Listing', listingSchema);
