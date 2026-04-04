const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  nomExpediteur: { type: String, required: true },
  emailExpediteur: { type: String, required: true },
  telephoneExpediteur: { type: String },
  contenu: { type: String, required: true },
  lu: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
