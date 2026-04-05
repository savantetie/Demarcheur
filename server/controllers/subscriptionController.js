const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { PLANS } = require('../config/plans');
const crypto = require('crypto');

/** GET /api/subscriptions/plans — plans publics */
exports.getPlans = (req, res) => {
  res.json({ plans: PLANS });
};

/** GET /api/subscriptions/mon-abonnement */
exports.monAbonnement = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ agence: req.user._id, statut: 'actif' }).sort({ createdAt: -1 });
    const planId = sub?.plan || 'gratuit';
    res.json({ abonnement: sub, plan: PLANS[planId] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** POST /api/subscriptions/souscrire */
exports.souscrire = async (req, res) => {
  try {
    const { planId, methode, numeroExpediteur, noteClient } = req.body;
    if (!PLANS[planId] || planId === 'gratuit') {
      return res.status(400).json({ message: 'Plan invalide.' });
    }
    const plan = PLANS[planId];
    const reference = 'DEM-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Créer la souscription en attente de paiement
    const sub = await Subscription.create({
      agence: req.user._id,
      plan: planId,
      statut: 'en_attente',
      paiement: {
        methode: methode || 'orange_money',
        reference,
        montant: plan.prix,
        numeroExpediteur: numeroExpediteur || '',
        noteClient: noteClient || '',
      },
    });

    res.status(201).json({
      abonnement: sub,
      reference,
      plan,
      message: 'Paiement soumis. L\'administrateur va valider votre abonnement sous 24h.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** POST /api/subscriptions/simuler-paiement/:id — simulation paiement réussi */
exports.simulerPaiement = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, agence: req.user._id });
    if (!sub) return res.status(404).json({ message: 'Souscription introuvable.' });

    const plan = PLANS[sub.plan];
    const maintenant = new Date();
    const dateFin = new Date(maintenant.getTime() + plan.dureeJours * 86400000);

    sub.statut = 'actif';
    sub.dateDebut = maintenant;
    sub.dateFin = dateFin;
    sub.paiement.confirme = true;
    sub.paiement.dateReglement = maintenant;
    await sub.save();

    // Mettre à jour l'agence
    await User.findByIdAndUpdate(req.user._id, {
      'agence.abonnement.statut': 'actif',
      'agence.abonnement.plan': sub.plan,
      'agence.abonnement.dateDebut': maintenant,
      'agence.abonnement.dateFin': dateFin,
    });

    res.json({ abonnement: sub, plan, message: `Plan ${plan.nom} activé jusqu'au ${dateFin.toLocaleDateString('fr-FR')}.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/subscriptions/historique */
exports.historique = async (req, res) => {
  try {
    const subs = await Subscription.find({ agence: req.user._id }).sort({ createdAt: -1 });
    res.json({ historique: subs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin
/** GET /api/subscriptions/admin/all */
exports.adminAll = async (req, res) => {
  try {
    const subs = await Subscription.find().populate('agence', 'nom email agence').sort({ createdAt: -1 });
    const revenus = subs.filter(s => s.paiement.confirme).reduce((acc, s) => acc + (s.paiement.montant || 0), 0);
    res.json({ abonnements: subs, revenus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** PATCH /api/subscriptions/admin/:id/confirmer */
exports.adminConfirmer = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id).populate('agence');
    if (!sub) return res.status(404).json({ message: 'Introuvable.' });

    const plan = PLANS[sub.plan];
    const maintenant = new Date();
    const dateFin = new Date(maintenant.getTime() + plan.dureeJours * 86400000);

    sub.statut = 'actif';
    sub.dateDebut = maintenant;
    sub.dateFin = dateFin;
    sub.paiement.confirme = true;
    sub.paiement.dateReglement = maintenant;
    await sub.save();

    await User.findByIdAndUpdate(sub.agence._id, {
      'agence.abonnement.statut': 'actif',
      'agence.abonnement.plan': sub.plan,
      'agence.abonnement.dateDebut': maintenant,
      'agence.abonnement.dateFin': dateFin,
    });

    res.json({ abonnement: sub });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helpers
function getInstructionsPaiement(methode, montant, reference) {
  const prix = new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(montant) + ' GNF';
  const instructions = {
    orange_money: `Envoyez ${prix} au +224 XXX XXX XXX (Orange Money). Référence : ${reference}`,
    mtn_money: `Envoyez ${prix} au +224 XXX XXX XXX (MTN Money). Référence : ${reference}`,
    virement: `Virement bancaire de ${prix} au compte IBAN XX. Référence : ${reference}`,
    especes: `Rendez-vous à nos bureaux avec ${prix} en espèces. Référence : ${reference}`,
    simulation: `[MODE TEST] Cliquez sur "Simuler paiement" pour activer immédiatement.`,
  };
  return instructions[methode] || instructions.simulation;
}
