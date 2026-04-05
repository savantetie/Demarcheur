const Listing = require('../models/Listing');
const User = require('../models/User');
const emailService = require('../utils/email');
const cloudinary = require('cloudinary').v2;

exports.tableau = async (req, res) => {
  try {
    const [totalAnnonces, enAttente, publiees, louees, vendues, totalUsers, totalAgences, agencesEnAttente] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ statut: 'en_attente' }),
      Listing.countDocuments({ statut: 'publie' }),
      Listing.countDocuments({ statut: 'loue' }),
      Listing.countDocuments({ statut: 'vendu' }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'agency' }),
      User.countDocuments({ role: 'agency', 'agence.valide': false }),
    ]);

    const parType = await Listing.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.json({ totalAnnonces, enAttente, publiees, louees, vendues, totalUsers, totalAgences, agencesEnAttente, parType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Annonces
exports.annonceEnAttente = async (req, res) => {
  try {
    const annonces = await Listing.find({ statut: 'en_attente' })
      .populate('proprietaire', 'nom email telephone role agence')
      .sort({ createdAt: -1 });
    res.json({ annonces });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.validerAnnonce = async (req, res) => {
  try {
    const { decision } = req.body;
    if (!['publie', 'rejete'].includes(decision)) {
      return res.status(400).json({ message: 'Décision invalide.' });
    }
    const annonce = await Listing.findByIdAndUpdate(req.params.id, { statut: decision }, { new: true });
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable.' });
    res.json({ annonce });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toutesAnnonces = async (req, res) => {
  try {
    const { statut, page = 1, limite = 20 } = req.query;
    const filtre = statut ? { statut } : {};
    const total = await Listing.countDocuments(filtre);
    const annonces = await Listing.find(filtre)
      .populate('proprietaire', 'nom email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limite)
      .limit(Number(limite));
    res.json({ annonces, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Utilisateurs
exports.gererUtilisateurs = async (req, res) => {
  try {
    const { role } = req.query;
    const filtre = role ? { role } : {};
    const users = await User.find(filtre).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleUtilisateur = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Impossible de modifier un admin.' });
    user.actif = !user.actif;
    await user.save({ validateBeforeSave: false });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Validation agences
exports.agencesEnAttente = async (req, res) => {
  try {
    const agences = await User.find({ role: 'agency', 'agence.valide': false, actif: true })
      .sort({ 'agence.dateDemande': -1 });
    res.json({ agences });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.voirDocumentAgence = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user?.agence?.documentRCCM) {
      return res.status(404).json({ message: 'Aucun document disponible.' });
    }
    // Extraire le public_id depuis l'URL Cloudinary
    const url = user.agence.documentRCCM;
    const publicId = user.agence.documentRCCMId || url.split('/upload/')[1].replace(/^v\d+\//, '');
    // Générer une URL signée valable 1 heure
    const signedUrl = cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      resource_type: 'image',
    });
    res.redirect(signedUrl);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.validerAgence = async (req, res) => {
  try {
    const { decision } = req.body; // 'approuver' ou 'rejeter'
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'agency') {
      return res.status(404).json({ message: 'Agence introuvable.' });
    }

    if (decision === 'approuver') {
      user.agence.valide = true;
      user.agence.dateValidation = new Date();
      user.agence.abonnement = { statut: 'actif', dateDebut: new Date(), dateFin: new Date(Date.now() + 30 * 86400000) };
    } else {
      user.actif = false;
    }
    await user.save({ validateBeforeSave: false });

    try { await emailService.envoyerValidationAgence(user, decision === 'approuver'); } catch {}

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
