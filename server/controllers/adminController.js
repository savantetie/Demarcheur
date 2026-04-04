const Listing = require('../models/Listing');
const User = require('../models/User');
const Message = require('../models/Message');

exports.annonceEnAttente = async (req, res) => {
  try {
    const annonces = await Listing.find({ statut: 'en_attente' })
      .populate('proprietaire', 'nom email telephone')
      .sort({ createdAt: -1 });
    res.json({ annonces });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.validerAnnonce = async (req, res) => {
  try {
    const { decision } = req.body; // 'publie' ou 'rejete'
    if (!['publie', 'rejete'].includes(decision)) {
      return res.status(400).json({ message: 'Décision invalide.' });
    }
    const annonce = await Listing.findByIdAndUpdate(
      req.params.id,
      { statut: decision },
      { new: true }
    );
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
      .populate('proprietaire', 'nom email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limite)
      .limit(Number(limite));
    res.json({ annonces, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.gererUtilisateurs = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleUtilisateur = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    user.actif = !user.actif;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.tableau = async (req, res) => {
  try {
    const [totalAnnonces, enAttente, publiees, louees, vendues, totalUsers] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ statut: 'en_attente' }),
      Listing.countDocuments({ statut: 'publie' }),
      Listing.countDocuments({ statut: 'loue' }),
      Listing.countDocuments({ statut: 'vendu' }),
      User.countDocuments(),
    ]);

    const parType = await Listing.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.json({
      totalAnnonces, enAttente, publiees, louees, vendues, totalUsers, parType,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
