import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">🏠 Démarcheur</span>
          <p>La plateforme immobilière de référence en Guinée.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Annonces</Link>
          <Link to="/inscription">Publier une annonce</Link>
          <Link to="/connexion">Connexion</Link>
        </div>
        <div className="footer-contact">
          <p>📍 Conakry, Guinée</p>
          <p>📞 +224 XXX XXX XXX</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Démarcheur. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
