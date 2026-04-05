const Alert = require('../models/Alert');

exports.creerAlerte = async (req, res) => {
  try {
    const { nom, criteres } = req.body;
    if (!nom) return res.status(400).json({ message: 'Nom de l\'alerte requis.' });
    const alerte = await Alert.create({ utilisateur: req.user._id, nom, criteres });
    res.status(201).json({ alerte });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.mesAlertes = async (req, res) => {
  try {
    const alertes = await Alert.find({ utilisateur: req.user._id }).sort({ createdAt: -1 });
    res.json({ alertes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.supprimerAlerte = async (req, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, utilisateur: req.user._id });
    res.json({ message: 'Alerte supprimée.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleAlerte = async (req, res) => {
  try {
    const alerte = await Alert.findOne({ _id: req.params.id, utilisateur: req.user._id });
    if (!alerte) return res.status(404).json({ message: 'Alerte introuvable.' });
    alerte.active = !alerte.active;
    await alerte.save();
    res.json({ alerte });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
