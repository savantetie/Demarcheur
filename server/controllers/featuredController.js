const Listing = require('../models/Listing');
const Subscription = require('../models/Subscription');
const { PLANS } = require('../config/plans');

// Coûts de boost en GNF (déduits du quota featuredMax du plan)
const BOOST_DUREES = {
  top: 7,        // 7 jours en tête de liste
  premium: 14,   // 14 jours avec badge premium
  sponsorise: 30, // 30 jours sponsorisé
};

/** POST /api/featured/:id/booster — booster une annonce */
exports.boosterAnnonce = async (req, res) => {
  try {
    const { type } = req.body; // top | premium | sponsorise
    if (!BOOST_DUREES[type]) {
      return res.status(400).json({ message: 'Type de boost invalide.' });
    }

    const annonce = await Listing.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable.' });
    if (annonce.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    if (annonce.statut !== 'publie') {
      return res.status(400).json({ message: 'Seules les annonces publiées peuvent être boostées.' });
    }

    // Vérifier le plan actif de l'agence
    const sub = await Subscription.findOne({ agence: req.user._id, statut: 'actif' });
    const planId = sub?.plan || 'gratuit';
    const plan = PLANS[planId];

    if (plan.maxFeatured === 0) {
      return res.status(403).json({ message: 'Votre plan ne permet pas de booster des annonces. Passez à un plan payant.' });
    }

    // Compter les boosts actifs ce mois
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const boostsActifs = await Listing.countDocuments({
      proprietaire: req.user._id,
      featured: true,
      featuredExpiry: { $gte: new Date() },
    });

    if (boostsActifs >= plan.maxFeatured) {
      return res.status(403).json({
        message: `Limite de ${plan.maxFeatured} annonces boostées atteinte pour votre plan ${plan.nom}.`,
      });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + BOOST_DUREES[type]);

    annonce.featured = true;
    annonce.featuredType = type;
    annonce.featuredExpiry = expiry;
    await annonce.save();

    res.json({
      annonce,
      message: `Annonce boostée en mode "${type}" jusqu'au ${expiry.toLocaleDateString('fr-FR')}.`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** DELETE /api/featured/:id/booster — retirer le boost */
exports.retirerBoost = async (req, res) => {
  try {
    const annonce = await Listing.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable.' });
    if (annonce.proprietaire.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    annonce.featured = false;
    annonce.featuredType = null;
    annonce.featuredExpiry = null;
    await annonce.save();

    res.json({ message: 'Boost retiré.', annonce });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/featured — annonces boostées publiques */
exports.getAnnoncesBoostees = async (req, res) => {
  try {
    const annonces = await Listing.find({
      statut: 'publie',
      featured: true,
      featuredExpiry: { $gte: new Date() },
    })
      .populate('proprietaire', 'nom agence')
      .sort({ featuredType: 1, createdAt: -1 })
      .limit(20);

    res.json({ annonces });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
