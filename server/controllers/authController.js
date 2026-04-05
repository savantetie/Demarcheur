const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Listing = require('../models/Listing');
const emailService = require('../utils/email');

const genererToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const genererTokenVerif = () => crypto.randomBytes(32).toString('hex');

/** POST /api/auth/inscription/user */
exports.inscriptionUser = async (req, res) => {
  try {
    const { nom, email, telephone, motDePasse } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const token = genererTokenVerif();
    const user = await User.create({
      nom, email, telephone, motDePasse,
      role: 'user',
      tokenVerification: token,
      tokenVerifExpire: Date.now() + 24 * 3600 * 1000,
    });

    // Envoi email de vérification (silencieux si non configuré)
    try { await emailService.envoyerVerification(user, token); } catch {}

    res.status(201).json({
      token: genererToken(user._id),
      user,
      message: 'Compte créé ! Vérifiez votre email pour activer votre compte.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/** POST /api/auth/inscription/agence */
exports.inscriptionAgence = async (req, res) => {
  try {
    const { nom, email, telephone, motDePasse, nomEntreprise, numeroEnregistrement, adresse, siteWeb, description, ville } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const token = genererTokenVerif();
    const user = await User.create({
      nom, email, telephone, motDePasse, ville,
      role: 'agency',
      tokenVerification: token,
      tokenVerifExpire: Date.now() + 24 * 3600 * 1000,
      agence: {
        nomEntreprise, numeroEnregistrement, adresse, siteWeb, description,
        valide: false,
        dateDemande: new Date(),
      },
    });

    try {
      await emailService.envoyerVerification(user, token);
      await emailService.envoyerConfirmationAgence(user);
    } catch {}

    res.status(201).json({
      token: genererToken(user._id),
      user,
      message: 'Demande d\'agence soumise ! Elle sera examinée sous 24-48h.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/** POST /api/auth/connexion */
exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ email }).select('+motDePasse');

    if (!user || !(await user.verifierMotDePasse(motDePasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }
    if (!user.actif || user.banniere) {
      return res.status(403).json({ message: 'Compte suspendu. Contactez le support.' });
    }

    user.dernierAcces = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({ token: genererToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/auth/moi */
exports.moi = async (req, res) => {
  res.json({ user: req.user });
};

/** GET /api/auth/verifier-email/:token */
exports.verifierEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      tokenVerification: req.params.token,
      tokenVerifExpire: { $gt: Date.now() },
    }).select('+tokenVerification +tokenVerifExpire');

    if (!user) {
      return res.status(400).json({ message: 'Lien de vérification invalide ou expiré.' });
    }

    user.emailVerifie = true;
    user.tokenVerification = undefined;
    user.tokenVerifExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email vérifié avec succès !' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** POST /api/auth/favoris/:id */
exports.toggleFavori = async (req, res) => {
  try {
    const user = req.user;
    const listingId = req.params.id;
    const existe = user.favoris.includes(listingId);

    if (existe) {
      user.favoris = user.favoris.filter(id => id.toString() !== listingId);
    } else {
      user.favoris.push(listingId);
    }
    await user.save({ validateBeforeSave: false });
    res.json({ favoris: user.favoris, ajoute: !existe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/auth/favoris */
exports.mesFavoris = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favoris',
      match: { statut: 'publie' },
      populate: { path: 'proprietaire', select: 'nom telephone' },
    });
    res.json({ favoris: user.favoris });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** POST /api/auth/avatar */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image fournie.' });

    // Supprimer l'ancien avatar Cloudinary si existant
    if (req.user.avatarId) {
      try { await require('cloudinary').v2.uploader.destroy(req.user.avatarId); } catch {}
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path, avatarId: req.file.filename },
      { new: true }
    );
    res.json({ user, message: 'Photo de profil mise à jour.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** DELETE /api/auth/avatar */
exports.supprimerAvatar = async (req, res) => {
  try {
    if (req.user.avatarId) {
      try { await require('cloudinary').v2.uploader.destroy(req.user.avatarId); } catch {}
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { avatar: '', avatarId: '' } },
      { new: true }
    );
    res.json({ user, message: 'Photo supprimée.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** POST /api/auth/agence/document */
exports.uploadDocumentAgence = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun document fourni.' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'agence.documentRCCM': req.file.path,
        'agence.documentRCCMId': req.file.filename,
      },
      { new: true }
    );
    res.json({ user, message: 'Document RCCM uploadé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** PUT /api/auth/profil */
exports.modifierProfil = async (req, res) => {
  try {
    const { nom, telephone, bio, ville } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nom, telephone, bio, ville },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
