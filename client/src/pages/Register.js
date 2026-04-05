import React from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

export default function Register() {
  return (
    <div className="register-choice-page">
      <div className="register-choice-container">
        <div className="register-choice-header">
          <Link to="/" className="register-logo">🏠 Démarcheur</Link>
          <h1>Créer un compte</h1>
          <p>Choisissez le type de compte qui correspond à votre besoin</p>
        </div>

        <div className="register-choice-cards">
          {/* Particulier */}
          <Link to="/inscription/particulier" className="register-choice-card">
            <div className="choice-icon">👤</div>
            <h2>Particulier</h2>
            <p>Je cherche un logement ou je veux louer / vendre mon bien</p>
            <ul className="choice-features">
              <li>✓ Consulter toutes les annonces</li>
              <li>✓ Sauvegarder vos favoris</li>
              <li>✓ Créer des alertes immobilières</li>
              <li>✓ Publier jusqu'à 3 annonces</li>
              <li>✓ Contacter les propriétaires</li>
            </ul>
            <div className="choice-badge gratuit">Gratuit</div>
            <div className="choice-cta">S'inscrire comme particulier →</div>
          </Link>

          {/* Agence */}
          <Link to="/inscription/agence" className="register-choice-card featured">
            <div className="choice-badge pro">Professionnel</div>
            <div className="choice-icon">🏢</div>
            <h2>Agence / Professionnel</h2>
            <p>Je suis une agence immobilière ou un promoteur professionnel</p>
            <ul className="choice-features">
              <li>✓ Annonces illimitées</li>
              <li>✓ Page agence personnalisée</li>
              <li>✓ Tableau de bord avancé</li>
              <li>✓ Statistiques de vos annonces</li>
              <li>✓ Support prioritaire</li>
            </ul>
            <div className="choice-cta">S'inscrire comme professionnel →</div>
          </Link>
        </div>

        <p className="register-login-link">
          Déjà un compte ? <Link to="/connexion">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
