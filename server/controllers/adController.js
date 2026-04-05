const Ad = require('../models/Ad');

/** GET /api/ads?emplacement=homepage_top — annonces publicitaires actives */
exports.getAds = async (req, res) => {
  try {
    const { emplacement } = req.query;
    const filtre = { statut: 'actif', dateFin: { $gte: new Date() } };
    if (emplacement) filtre.emplacement = emplacement;

    const ads = await Ad.find(filtre).populate('annonceur', 'nom agence');

    // Incrémenter impressions en arrière-plan
    if (ads.length > 0) {
      Ad.updateMany({ _id: { $in: ads.map(a => a._id) } }, { $inc: { impressions: 1 } }).exec();
    }

    res.json({ ads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** POST /api/ads/:id/clic — enregistrer un clic */
exports.enregistrerClic = async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, { $inc: { clics: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** POST /api/ads — créer une publicité (agence Elite) */
exports.creerAd = async (req, res) => {
  try {
    const { titre, imageUrl, lienCible, emplacement, dateDebut, dateFin, budget } = req.body;
    const ad = await Ad.create({
      annonceur: req.user._id,
      titre, imageUrl, lienCible, emplacement,
      dateDebut: dateDebut || new Date(),
      dateFin,
      budget,
      statut: 'inactif', // admin doit activer
    });
    res.status(201).json({ ad, message: 'Publicité créée, en attente de validation par l\'admin.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/ads/mes-pubs — mes publicités */
exports.mesPubs = async (req, res) => {
  try {
    const ads = await Ad.find({ annonceur: req.user._id }).sort({ createdAt: -1 });
    res.json({ ads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin
/** GET /api/ads/admin/all */
exports.adminAll = async (req, res) => {
  try {
    const ads = await Ad.find().populate('annonceur', 'nom email agence').sort({ createdAt: -1 });
    const totalBudget = ads.reduce((acc, a) => acc + (a.budget || 0), 0);
    const totalImpressions = ads.reduce((acc, a) => acc + a.impressions, 0);
    const totalClics = ads.reduce((acc, a) => acc + a.clics, 0);
    res.json({ ads, totalBudget, totalImpressions, totalClics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** PATCH /api/ads/admin/:id/statut */
exports.adminChangerStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    if (!['actif', 'inactif', 'expire'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }
    const ad = await Ad.findByIdAndUpdate(req.params.id, { statut }, { new: true });
    if (!ad) return res.status(404).json({ message: 'Publicité introuvable.' });
    res.json({ ad });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
