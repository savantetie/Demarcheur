import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './AgencesCarousel.css';

const COULEURS = ['#16a085','#2980b9','#8e44ad','#e67e22','#c0392b','#27ae60','#2c3e50','#d35400','#1abc9c','#6c5ce7'];

export default function AgencesCarousel() {
  const [agences, setAgences] = useState([]);

  useEffect(() => {
    api.get('/auth/agences-partenaires').then(res => {
      setAgences(res.data.agences || []);
    }).catch(() => {});
  }, []);

  if (agences.length === 0) return null;

  // Dupliquer pour boucle infinie
  const items = [...agences, ...agences];

  return (
    <div className="agences-strip">
      <div className="agences-strip-label">Agences partenaires</div>
      <div className="agences-track-wrap">
        <div className="agences-track">
          {items.map((a, i) => {
            const sigle = a.agence?.nomEntreprise
              ? a.agence.nomEntreprise.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              : a.nom.slice(0, 2).toUpperCase();
            const couleur = COULEURS[i % COULEURS.length];
            return (
              <div className="agence-logo-card" key={i}>
                {a.agence?.logo
                  ? <img src={a.agence.logo} alt={sigle} className="agence-logo-img" />
                  : <div className="agence-sigle" style={{ background: couleur }}>{sigle}</div>
                }
                <span className="agence-nom">{a.agence?.nomEntreprise || a.nom}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
