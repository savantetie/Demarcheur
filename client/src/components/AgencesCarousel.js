import React from 'react';
import './AgencesCarousel.css';

const AGENCES = [
  { nom: 'Immo Conakry', sigle: 'IC', couleur: '#16a085' },
  { nom: 'Guinea Habitat', sigle: 'GH', couleur: '#2980b9' },
  { nom: 'Prestige Immo', sigle: 'PI', couleur: '#8e44ad' },
  { nom: 'Conakry Invest', sigle: 'CI', couleur: '#e67e22' },
  { nom: 'Alpha Immobilier', sigle: 'AI', couleur: '#c0392b' },
  { nom: 'Kaloum Agency', sigle: 'KA', couleur: '#27ae60' },
  { nom: 'Delta Properties', sigle: 'DP', couleur: '#2c3e50' },
  { nom: 'Ratoma Immo', sigle: 'RI', couleur: '#d35400' },
  { nom: 'Nongo Premium', sigle: 'NP', couleur: '#1abc9c' },
  { nom: 'Hamdallaye Realty', sigle: 'HR', couleur: '#6c5ce7' },
];

export default function AgencesCarousel() {
  // On duplique pour l'effet boucle infinie
  const items = [...AGENCES, ...AGENCES];

  return (
    <div className="agences-strip">
      <div className="agences-strip-label">Agences partenaires</div>
      <div className="agences-track-wrap">
        <div className="agences-track">
          {items.map((a, i) => (
            <div className="agence-logo-card" key={i}>
              <div className="agence-sigle" style={{ background: a.couleur }}>
                {a.sigle}
              </div>
              <span className="agence-nom">{a.nom}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
