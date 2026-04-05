const Listing = require('../models/Listing');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

/** GET /api/analytics/agence — stats de l'agence connectée */
exports.statsAgence = async (req, res) => {
  try {
    const userId = req.user._id;

    const [annonces, sub] = await Promise.all([
      Listing.find({ proprietaire: userId }),
      Subscription.findOne({ agence: userId, statut: 'actif' }),
    ]);

    const totalAnnonces = annonces.length;
    const annoncesPubliees = annonces.filter(a => a.statut === 'publie').length;
    const annoncesBoostees = annonces.filter(a => a.featured && a.featuredExpiry >= new Date()).length;
    const totalVues = annonces.reduce((acc, a) => acc + (a.vues || 0), 0);
    const totalContacts = annonces.reduce((acc, a) => acc + (a.contactsRecus || 0), 0);

    // Top 5 annonces par vues
    const topAnnonces = [...annonces]
      .sort((a, b) => (b.vues || 0) - (a.vues || 0))
      .slice(0, 5)
      .map(a => ({ _id: a._id, titre: a.titre, vues: a.vues, contactsRecus: a.contactsRecus, statut: a.statut }));

    // Répartition par type
    const parType = annonces.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalAnnonces,
      annoncesPubliees,
      annoncesBoostees,
      totalVues,
      totalContacts,
      topAnnonces,
      parType,
      abonnement: sub,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** PATCH /api/analytics/listings/:id/vue — incrémenter vues */
exports.incrementerVue = async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, { $inc: { vues: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** PATCH /api/analytics/listings/:id/contact — incrémenter contacts */
exports.incrementerContact = async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, { $inc: { contactsRecus: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/analytics/admin — stats globales admin */
exports.statsAdmin = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAgences,
      totalListings,
      listingsPublies,
      subsActives,
      subsMois,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'agency' }),
      Listing.countDocuments(),
      Listing.countDocuments({ statut: 'publie' }),
      Subscription.countDocuments({ statut: 'actif' }),
      Subscription.find({
        statut: 'actif',
        createdAt: { $gte: new Date(new Date().setDate(1)) },
      }),
    ]);

    const revenusMois = subsMois.reduce((acc, s) => acc + (s.paiement?.montant || 0), 0);

    // Répartition des plans
    const parPlan = await Subscription.aggregate([
      { $match: { statut: 'actif' } },
      { $group: { _id: '$plan', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      totalAgences,
      totalListings,
      listingsPublies,
      subsActives,
      revenusMois,
      parPlan,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
