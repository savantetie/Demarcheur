import React from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

const LABELS_TYPE = {
  'location': 'Location',
  'vente-maison': 'Vente',
  'terrain': 'Terrain',
};

const formaterPrix = (prix) =>
  new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(prix) + ' GNF';

const tempsDepuis = (date) => {
  const jours = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return 'Hier';
  return `Il y a ${jours}j`;
};

export default function ListingCard({ annonce }) {
  const photo = annonce.photos?.[0]?.url;

  return (
    <Link to={`/annonce/${annonce._id}`} className="listing-card">
      <div className="listing-card-img">
        {photo ? (
          <img src={photo} alt={annonce.titre} loading="lazy" />
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'3rem', color:'#cbd5e0' }}>🏠</div>
        )}

        <div className="listing-card-badges">
          <span className={`listing-type listing-type-${annonce.type}`}>
            {LABELS_TYPE[annonce.type]}
          </span>
        </div>

        <button className="listing-card-fav" onClick={e => e.preventDefault()} title="Sauvegarder">
          🤍
        </button>

        {(annonce.statut === 'loue' || annonce.statut === 'vendu') && (
          <div className="listing-overlay">
            {annonce.statut === 'loue' ? 'LOUÉ' : 'VENDU'}
          </div>
        )}
      </div>

      <div className="listing-card-body">
        <div className="listing-prix">
          {formaterPrix(annonce.prix)}
          {annonce.type === 'location' && <span className="listing-prix-suffix">/mois</span>}
        </div>

        <h3 className="listing-titre">{annonce.titre}</h3>

        <p className="listing-localisation">
          📍 {annonce.quartier}, {annonce.ville}
        </p>

        <div className="listing-divider" />

        <div className="listing-card-footer">
          <span>{annonce.proprietaire?.nom || 'Propriétaire'}</span>
          <span>{tempsDepuis(annonce.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
