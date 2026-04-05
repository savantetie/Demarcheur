/**
 * Plans d'abonnement de la plateforme Démarcheur
 * Prix en Francs Guinéens (GNF)
 */
const PLANS = {
  gratuit: {
    id: 'gratuit',
    nom: 'Gratuit',
    prix: 0,
    devise: 'GNF',
    maxAnnonces: 3,
    maxFeatured: 0,
    dureeJours: null,
    badge: null,
    features: [
      '3 annonces maximum',
      'Accès aux favoris',
      'Alertes immobilières',
      'Contact via formulaire',
    ],
  },
  basic: {
    id: 'basic',
    nom: 'Basic',
    prix: 50000,
    devise: 'GNF',
    maxAnnonces: 20,
    maxFeatured: 2,
    dureeJours: 30,
    badge: 'basic',
    features: [
      '20 annonces actives',
      '2 annonces boostées / mois',
      'Page agence personnalisée',
      'Tableau de bord stats',
      'Support email',
    ],
  },
  premium: {
    id: 'premium',
    nom: 'Premium',
    prix: 150000,
    devise: 'GNF',
    maxAnnonces: 50,
    maxFeatured: 10,
    dureeJours: 30,
    badge: 'premium',
    populaire: true,
    features: [
      '50 annonces actives',
      '10 annonces boostées / mois',
      'Badge "Agence Vérifiée"',
      'Priorité dans les résultats',
      'Analytics avancées',
      'Export rapports CSV',
      'Support prioritaire',
    ],
  },
  elite: {
    id: 'elite',
    nom: 'Elite',
    prix: 300000,
    devise: 'GNF',
    maxAnnonces: Infinity,
    maxFeatured: 30,
    dureeJours: 30,
    badge: 'elite',
    features: [
      'Annonces illimitées',
      '30 annonces boostées / mois',
      'Badge "Partenaire Elite"',
      'Position #1 garantie',
      'Analytics complètes + export PDF',
      'Bannière publicitaire offerte',
      'Account manager dédié',
      'API accès données',
    ],
  },
};

const formaterPrix = (prix) =>
  prix === 0 ? 'Gratuit' : new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(prix) + ' GNF';

module.exports = { PLANS, formaterPrix };
