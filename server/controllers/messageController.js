const Message = require('../models/Message');
const Listing = require('../models/Listing');

exports.envoyerMessage = async (req, res) => {
  try {
    const { nomExpediteur, emailExpediteur, telephoneExpediteur, contenu } = req.body;
    const annonce = await Listing.findById(req.params.id);
    if (!annonce || annonce.statut !== 'publie') {
      return res.status(404).json({ message: 'Annonce introuvable.' });
    }
    const message = await Message.create({
      annonce: annonce._id,
      nomExpediteur,
      emailExpediteur,
      telephoneExpediteur,
      contenu,
    });
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.messagesRecus = async (req, res) => {
  try {
    const mesAnnonces = await Listing.find({ proprietaire: req.user._id }).select('_id');
    const ids = mesAnnonces.map(a => a._id);
    const messages = await Message.find({ annonce: { $in: ids } })
      .populate('annonce', 'titre')
      .sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.marquerLu = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.msgId, { lu: true });
    res.json({ message: 'Message marqué comme lu.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
