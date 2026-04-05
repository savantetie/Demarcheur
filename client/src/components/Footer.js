import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <span className="footer-logo">🏠 Démarcheur</span>
          <p>La plateforme immobilière de référence en Guinée. Trouvez votre maison, terrain ou location à Conakry et partout dans le pays.</p>
          <div className="footer-contact">
            <a href="tel:+224610100165">📞 +224 610 10 01 65</a>
            <a href="mailto:contact@demarcheur.gn">✉️ contact@demarcheur.gn</a>
            <a href="https://wa.me/224610100165" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
          </div>
          <div className="footer-social">
            <a href="#!" title="Facebook">📘</a>
            <a href="#!" title="WhatsApp">💬</a>
            <a href="#!" title="Instagram">📷</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Annonces</h4>
          <ul>
            <li><Link to="/?type=location">Locations</Link></li>
            <li><Link to="/?type=vente-maison">Ventes maison</Link></li>
            <li><Link to="/?type=terrain">Terrains</Link></li>
            <li><Link to="/nouvelle-annonce">Publier une annonce</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Villes</h4>
          <ul>
            <li><Link to="/?ville=Conakry">Conakry</Link></li>
            <li><Link to="/?ville=Kindia">Kindia</Link></li>
            <li><Link to="/?ville=Labé">Labé</Link></li>
            <li><Link to="/?ville=Kankan">Kankan</Link></li>
            <li><Link to="/?ville=Nzérékoré">Nzérékoré</Link></li>
            <li><Link to="/?ville=Boké">Boké</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Compte</h4>
          <ul>
            <li><Link to="/inscription">S'inscrire</Link></li>
            <li><Link to="/connexion">Se connecter</Link></li>
            <li><Link to="/tarifs">Offres agences</Link></li>
            <li><Link to="/tableau-de-bord">Mon espace</Link></li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          © {new Date().getFullYear()} Démarcheur. Tous droits réservés.
          <span className="footer-bottom-badge">📍 Conakry, Guinée</span>
        </p>
        <div className="footer-bottom-links">
          <a href="#!">Confidentialité</a>
          <a href="#!">Conditions</a>
          <Link to="/tarifs">Tarifs</Link>
          <a href="mailto:contact@demarcheur.gn">Contact</a>
        </div>
      </div>
    </footer>
  );
}
