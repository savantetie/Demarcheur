import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function NavAvatar({ user }) {
  const initiales = user?.nom
    ? user.nom.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div className="nav-avatar">
      {user?.avatar
        ? <img src={user.avatar} alt={user.nom} />
        : <span>{initiales}</span>
      }
    </div>
  );
}

export default function Navbar() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => { setMenuOuvert(false); }, [location]);

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏠</span>
          Démarcheur
        </Link>

        <button className="burger" onClick={() => setMenuOuvert(!menuOuvert)} aria-label="Menu">
          <span /><span /><span />
        </button>

        <div className={`navbar-links ${menuOuvert ? 'ouvert' : ''}`}>
          <NavLink to="/">Annonces</NavLink>
          <NavLink to="/tarifs">Tarifs</NavLink>

          {user ? (
            <>
              {user.role === 'admin' && <NavLink to="/admin">Administration</NavLink>}
              <NavLink to="/tableau-de-bord" className="nav-profil-link">
                <NavAvatar user={user} />
                <span>{user.nom.split(' ')[0]}</span>
              </NavLink>
              <NavLink to="/nouvelle-annonce" className="btn btn-or btn-sm">+ Publier</NavLink>
              <button className="btn btn-ghost btn-sm" onClick={handleDeconnexion}>Déconnexion</button>
            </>
          ) : (
            <>
              <NavLink to="/connexion">Connexion</NavLink>
              <NavLink to="/inscription" className="btn btn-primary btn-sm">S'inscrire</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
