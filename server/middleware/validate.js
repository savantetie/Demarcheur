const Joi = require('joi');

const repondre = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map(d => d.message.replace(/"/g, ''));
    return res.status(400).json({ message: messages[0], erreurs: messages });
  }
  next();
};

// Schémas de validation

exports.validerInscriptionUser = repondre(Joi.object({
  nom: Joi.string().min(2).max(80).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'any.required': 'Le nom est obligatoire',
  }),
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.email': 'Email invalide',
    'any.required': "L'email est obligatoire",
  }),
  telephone: Joi.string().min(8).max(20).required().messages({
    'any.required': 'Le téléphone est obligatoire',
  }),
  motDePasse: Joi.string().min(8).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Le mot de passe est obligatoire',
  }),
}));

exports.validerInscriptionAgence = repondre(Joi.object({
  nom: Joi.string().min(2).max(80).required(),
  email: Joi.string().email({ tlds: false }).required(),
  telephone: Joi.string().min(8).max(20).required(),
  motDePasse: Joi.string().min(8).required(),
  nomEntreprise: Joi.string().min(2).max(120).required().messages({
    'any.required': "Le nom de l'entreprise est obligatoire",
  }),
  numeroEnregistrement: Joi.string().max(50).allow('', null),
  adresse: Joi.string().max(200).allow('', null),
  siteWeb: Joi.string().uri().allow('', null).messages({
    'string.uri': 'URL du site web invalide',
  }),
  description: Joi.string().max(500).allow('', null),
  ville: Joi.string().max(80).allow('', null),
}));

exports.validerConnexion = repondre(Joi.object({
  email: Joi.string().email({ tlds: false }).required(),
  motDePasse: Joi.string().required(),
}));

exports.validerAnnonce = repondre(Joi.object({
  titre: Joi.string().min(5).max(150).required(),
  type: Joi.string().valid('location', 'vente-maison', 'terrain').required(),
  prix: Joi.number().min(0).required(),
  quartier: Joi.string().min(2).max(100).required(),
  ville: Joi.string().min(2).max(80).required(),
  description: Joi.string().min(20).max(3000).required().messages({
    'string.min': 'La description doit contenir au moins 20 caractères',
  }),
  telephone: Joi.string().allow('', null),
  whatsapp: Joi.string().allow('', null),
}));
