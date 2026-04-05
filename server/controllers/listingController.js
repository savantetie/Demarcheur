const Listing = require('../models/Listing');
const cloudinary = require('cloudinary').v2;

exports.getAnnonces = async (req, res) => {
  try {
    const { type, ville, quartier, prixMin, prixMax, page = 1, limite = 12 } = req.query;
    const filtre = { statut: 'publie' };
    if (type) filtre.type = type;
    if (ville) filtre.ville = new RegExp(ville, 'i');
    if (quartier) filtre.quartier = new RegExp(quartier, 'i');
    if (prixMin || prixMax) {
      filtre.prix = {};
      if (prixMin) filtre.prix.$gte = Number(prixMin);
      if (prixMax) filtre.prix.$lte = Number(prixMax);
    }

    const total = await Listing.countDocuments(filtre);
    const annonces = await Listing.find(filtre)
      .populate('proprietaire', 'nom telephone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limite)
      .limit(Number(limite));

    res.json({ annonces, total, pages: Math.ceil(total / limite), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnnonce = async (req, res) => {
  try {
    const annonce = await Listing.findById(req.params.id).populate('proprietaire', 'nom telephone whatsapp');
    if (!annonce || annonce.statut === 'rejete') {
      return res.status(404).json({ message: 'Annonce introuvable.' });
    }
    res.json({ annonce });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.creerAnnonce = async (req, res) => {
  try {
    const {
      titre, type, typeLogement, prix, quartier, ville, commune, repere,
      description, telephone, whatsapp,
      surface, surfaceTerrain, nbChambres, nbPieces, nbSDB, etage, etat,
      titreFoncier, negotiable, caution, chargesIncluses, disponibilite,
      refInterne, typeMandat,
    } = req.body;

    // equipements peut arriver comme tableau ou string séparé par virgules
    let equipements = [];
    if (req.body.equipements) {
      equipements = Array.isArray(req.body.equipements)
        ? req.body.equipements
        : req.body.equipements.split(',').map(e => e.trim()).filter(Boolean);
    }

    if (req.files?.length) console.log('Fichier reçu:', JSON.stringify(req.files[0], null, 2));
    const photos = (req.files || []).map(f => ({ url: f.path || f.secure_url, public_id: f.filename || f.public_id }));

    const annonce = await Listing.create({
      titre, type, prix, quartier, ville, description, photos,
      typeLogement: typeLogement || null,
      commune: commune || '',
      repere: repere || '',
      surface: surface ? Number(surface) : null,
      surfaceTerrain: surfaceTerrain ? Number(surfaceTerrain) : null,
      nbChambres: nbChambres ? Number(nbChambres) : null,
      nbPieces: nbPieces ? Number(nbPieces) : null,
      nbSDB: nbSDB ? Number(nbSDB) : null,
      etage: etage || '',
      etat: etat || null,
      titreFoncier: titreFoncier || null,
      equipements,
      negotiable: negotiable === 'true' || negotiable === true,
      caution: caution ? Number(caution) : 0,
      chargesIncluses: chargesIncluses === 'true' || chargesIncluses === true,
      disponibilite: disponibilite || 'immediate',
      refInterne: refInterne || '',
      typeMandat: typeMandat || null,
      telephone: telephone || req.user.telephone,
      whatsapp: whatsapp || req.user.telephone,
      proprietaire: req.user._id,
    });
    res.status(201).json({ annonce });
  } catch (err) {
    console.error('Erreur creerAnnonce:', err);
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

exports.modifierAnnonce = async (req, res) => {
  try {
    const annonce = await Listing.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable.' });
    if (annonce.proprietaire.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const mises = { ...req.body };
    if (req.files && req.files.length > 0) {
      mises.photos = req.files.map(f => ({ url: f.path, public_id: f.filename }));
    }
    // Repasse en attente de validation si le contenu change
    if (['location', 'vente-maison', 'terrain'].includes(mises.type)) {
      mises.statut = 'en_attente';
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, mises, { new: true });
    res.json({ annonce: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.supprimerAnnonce = async (req, res) => {
  try {
    const annonce = await Listing.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable.' });
    if (annonce.proprietaire.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    // Supprimer les photos Cloudinary
    for (const photo of annonce.photos) {
      if (photo.public_id) await cloudinary.uploader.destroy(photo.public_id);
    }
    await annonce.deleteOne();
    res.json({ message: 'Annonce supprimée.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.mesAnnonces = async (req, res) => {
  try {
    const annonces = await Listing.find({ proprietaire: req.user._id }).sort({ createdAt: -1 });
    res.json({ annonces });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changerStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const statutsAutorisés = ['loue', 'vendu'];
    if (!statutsAutorisés.includes(statut)) {
      return res.status(400).json({ message: 'Statut non autorisé.' });
    }
    const annonce = await Listing.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable.' });
    if (annonce.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    annonce.statut = statut;
    await annonce.save();
    res.json({ annonce });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
