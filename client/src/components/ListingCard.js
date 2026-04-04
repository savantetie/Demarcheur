import React from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

const LABELS_TYPE = {
  'location': 'Location',
  'vente-maison': 'Vente maison',
  'terrain': 'Terrain',
};

const formaterPrix = (prix) =>
  new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(prix);

export default function ListingCard({ annonce }) {
  const photo = annonce.photos?.[0]?.url || '/placeholder.jpg';

  return (
    <Link to={`/annonce/${annonce._id}`} className="listing-card">
      <div className="listing-card-img">
        <img src={photo} alt={annonce.titre} loading="lazy" />
        <span className={`listing-type listing-type-${annonce.type}`}>
          {LABELS_TYPE[annonce.type]}
        </span>
        {(annonce.statut === 'loue' || annonce.statut === 'vendu') && (
          <div className="listing-overlay">
            {annonce.statut === 'loue' ? 'LOUÉ' : 'VENDU'}
          </div>
        )}
      </div>
      <div className="listing-card-body">
        <h3 className="listing-titre">{annonce.titre}</h3>
        <p className="listing-localisation">
          📍 {annonce.quartier}, {annonce.ville}
        </p>
        <p className="listing-prix">{formaterPrix(annonce.prix)}
          {annonce.type === 'location' && <span className="listing-periode">/mois</span>}
        </p>
      </div>
    </Link>
  );
}
