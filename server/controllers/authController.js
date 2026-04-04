const jwt = require('jsonwebtoken');
const User = require('../models/User');

const genererToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.inscription = async (req, res) => {
  try {
    const { nom, email, telephone, motDePasse } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }
    const user = await User.create({ nom, email, telephone, motDePasse });
    res.status(201).json({ token: genererToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ email }).select('+motDePasse');
    if (!user || !(await user.verifierMotDePasse(motDePasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }
    if (!user.actif) {
      return res.status(403).json({ message: 'Compte désactivé.' });
    }
    res.json({ token: genererToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.moi = async (req, res) => {
  res.json({ user: req.user });
};
