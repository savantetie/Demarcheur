const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  telephone: { type: String, required: true, trim: true },
  motDePasse: { type: String, required: true, minlength: 8, select: false },

  role: {
    type: String,
    enum: ['user', 'agency', 'admin'],
    default: 'user',
  },

  // Vérification email
  emailVerifie: { type: Boolean, default: false },
  tokenVerification: { type: String, select: false },
  tokenVerifExpire: { type: Date, select: false },

  // Réinitialisation mot de passe
  tokenReset: { type: String, select: false },
  tokenResetExpire: { type: Date, select: false },

  // Favoris (ref vers Listing)
  favoris: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],

  // Profil
  avatar: { type: String },
  avatarId: { type: String },
  bio: { type: String, maxlength: 300 },
  ville: { type: String },

  // Statut du compte
  actif: { type: Boolean, default: true },
  banniere: { type: Boolean, default: false },
  dernierAcces: { type: Date },

  // Agence (si role === 'agency')
  agence: {
    nomEntreprise: { type: String },
    numeroEnregistrement: { type: String },
    adresse: { type: String },
    siteWeb: { type: String },
    description: { type: String },
    logo: { type: String },
    valide: { type: Boolean, default: false },
    dateDemande: { type: Date },
    dateValidation: { type: Date },
    documentRCCM: { type: String }, // URL Cloudinary du document
    documentRCCMId: { type: String }, // public_id Cloudinary
    abonnement: {
      statut: { type: String, enum: ['inactif', 'actif', 'expire'], default: 'inactif' },
      dateDebut: { type: Date },
      dateFin: { type: Date },
    },
  },
}, { timestamps: true });

// Index
userSchema.index({ email: 1 });
userSchema.index({ role: 1, actif: 1 });

// Hash mot de passe
userSchema.pre('save', async function (next) {
  if (!this.isModified('motDePasse')) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
  next();
});

userSchema.methods.verifierMotDePasse = function (mdp) {
  return bcrypt.compare(mdp, this.motDePasse);
};

// Nombre d'annonces autorisées
userSchema.methods.maxAnnonces = function () {
  if (this.role === 'admin') return Infinity;
  if (this.role === 'agency') return this.agence?.valide ? Infinity : 0;
  return 3; // utilisateur standard : 3 annonces max
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.motDePasse;
  delete obj.tokenVerification;
  delete obj.tokenReset;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
