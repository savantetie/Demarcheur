import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/');
    setMenuOuvert(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏠</span>
          <span>Démarcheur</span>
        </Link>

        <button className="burger" onClick={() => setMenuOuvert(!menuOuvert)} aria-label="Menu">
          <span /><span /><span />
        </button>

        <div className={`navbar-links ${menuOuvert ? 'ouvert' : ''}`}>
          <NavLink to="/" onClick={() => setMenuOuvert(false)}>Annonces</NavLink>

          {user ? (
            <>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setMenuOuvert(false)}>Administration</NavLink>
              )}
              <NavLink to="/tableau-de-bord" onClick={() => setMenuOuvert(false)}>Mon espace</NavLink>
              <NavLink to="/nouvelle-annonce" className="btn btn-primary btn-sm" onClick={() => setMenuOuvert(false)}>
                + Publier
              </NavLink>
              <button className="btn btn-secondary btn-sm" onClick={handleDeconnexion}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink to="/connexion" onClick={() => setMenuOuvert(false)}>Connexion</NavLink>
              <NavLink to="/inscription" className="btn btn-primary btn-sm" onClick={() => setMenuOuvert(false)}>
                S'inscrire
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
