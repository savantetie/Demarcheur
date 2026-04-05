import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import FilterBar from '../components/FilterBar';
import api from '../utils/api';
import './Home.css';

const VILLES_HERO = ['Conakry', 'Kindia', 'Labé', 'Kankan', 'Nzérékoré', 'Boké', 'Mamou'];

const TYPES = [
  { value: '', label: '🏘️ Tout' },
  { value: 'location', label: '🔑 Location' },
  { value: 'vente-maison', label: '🏠 Achat' },
  { value: 'terrain', label: '🌿 Terrain' },
];

const POURQUOI = [
  { icon: '✅', titre: 'Annonces vérifiées', desc: 'Chaque annonce est examinée par notre équipe avant publication pour garantir la fiabilité.' },
  { icon: '⚡', titre: 'Réponse rapide', desc: 'Contactez directement les propriétaires et agences par WhatsApp ou message en un clic.' },
  { icon: '🔒', titre: '100% sécurisé', desc: 'Vos données sont protégées. Nous ne partageons jamais vos informations sans votre accord.' },
  { icon: '🌍', titre: 'Toute la Guinée', desc: 'De Conakry à Nzérékoré, trouvez votre bien partout dans le pays en quelques secondes.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [annonces, setAnnonces] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [filtres, setFiltres] = useState({});
  const [typeActif, setTypeActif] = useState('');
  const [heroRecherche, setHeroRecherche] = useState({ ville: '', type: '' });

  const charger = useCallback(async (params = {}, page = 1) => {
    setChargement(true);
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries({ ...params, page, limite: 12 }).filter(([, v]) => v !== ''))
      );
      const res = await api.get(`/listings?${query}`);
      setAnnonces(res.data.annonces);
      setPagination({ total: res.data.total, pages: res.data.pages, page: res.data.page });
    } catch {
      setAnnonces([]);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const handleFiltrer = (f) => {
    const clean = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''));
    setFiltres(clean);
    setTypeActif(f.type || '');
    charger(clean, 1);
  };

  const handleType = (type) => {
    setTypeActif(type);
    const newFiltres = { ...filtres, type };
    if (!type) delete newFiltres.type;
    setFiltres(newFiltres);
    charger(newFiltres, 1);
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const clean = Object.fromEntries(Object.entries(heroRecherche).filter(([, v]) => v !== ''));
    setFiltres(clean);
    setTypeActif(heroRecherche.type || '');
    charger(clean, 1);
    document.getElementById('annonces-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePage = (p) => {
    charger(filtres, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>

      {/* ══════════════════════════════════════
          HERO — Image fond + contenu centré
      ══════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-bg-img" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero-agent.jpg)` }} />
        <div className="hero-bg-overlay" />
        <div className="hero-bg-grid" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            🇬🇳 Plateforme N°1 de l'immobilier en Guinée
          </div>

          <h1>
            Trouvez votre{' '}
            <span className="hero-highlight">bien idéal</span>
            <br />en Guinée
          </h1>

          <p className="hero-sub">
            Maisons, villas, terrains et locations à Conakry et dans tout le pays.<br />
            Des milliers d'annonces vérifiées vous attendent.
          </p>

          {/* Barre de recherche */}
          <form className="hero-search" onSubmit={handleHeroSearch}>
            <div className="hs-field">
              <span className="hs-icon">🏷️</span>
              <select value={heroRecherche.type} onChange={e => setHeroRecherche(p => ({ ...p, type: e.target.value }))}>
                <option value="">Tous les types</option>
                <option value="location">Location</option>
                <option value="vente-maison">Achat maison</option>
                <option value="terrain">Terrain</option>
              </select>
            </div>
            <div className="hs-divider" />
            <div className="hs-field">
              <span className="hs-icon">📍</span>
              <select value={heroRecherche.ville} onChange={e => setHeroRecherche(p => ({ ...p, ville: e.target.value }))}>
                <option value="">Toutes les villes</option>
                {VILLES_HERO.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <button type="submit" className="hs-btn">
              🔍 Rechercher
            </button>
          </form>

          {/* Quartiers populaires */}
          <div className="hero-quick">
            <span>Populaire :</span>
            {['Kipé', 'Hamdallaye', 'Ratoma', 'Nongo', 'Bambeto'].map(q => (
              <button key={q} className="hero-quick-tag"
                onClick={() => {
                  setFiltres({ quartier: q });
                  charger({ quartier: q }, 1);
                  document.getElementById('annonces-section')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                {q}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{pagination.total > 0 ? pagination.total + '+' : '500+'}</span>
              <span className="hero-stat-label">Annonces actives</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-num">9</span>
              <span className="hero-stat-label">Villes couvertes</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">Gratuit</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          POURQUOI DÉMARCHEUR
      ══════════════════════════════════════ */}
      <section className="section-pourquoi">
        <div className="container">
          <div className="section-label">Pourquoi nous choisir</div>
          <h2 className="section-titre">La référence immobilière en Guinée</h2>
          <div className="pourquoi-grid">
            {POURQUOI.map((p, i) => (
              <div key={i} className="pourquoi-card">
                <div className="pourquoi-icon">{p.icon}</div>
                <h3>{p.titre}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FILTRES
      ══════════════════════════════════════ */}
      <section className="section-filtres">
        <div className="container">
          <FilterBar onFiltrer={handleFiltrer} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          ANNONCES
      ══════════════════════════════════════ */}
      <section className="page" id="annonces-section">
        <div className="container">

          <div className="annonces-top-bar">
            <div className="types-rapides">
              {TYPES.map(t => (
                <button key={t.value} className={`type-pill ${typeActif === t.value ? 'actif' : ''}`} onClick={() => handleType(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
            <p className="resultats-count">
              <strong>{pagination.total}</strong> annonce{pagination.total !== 1 ? 's' : ''} trouvée{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>

          {chargement ? (
            <div className="spinner-wrap"><div className="spinner"></div></div>
          ) : annonces.length === 0 ? (
            <div className="vide-state">
              <div className="vide-icon">🏗️</div>
              <h3>Aucune annonce trouvée</h3>
              <p>Modifiez vos critères de recherche ou revenez plus tard.</p>
            </div>
          ) : (
            <>
              <div className="grille-annonces">
                {annonces.map(a => <ListingCard key={a._id} annonce={a} />)}
              </div>
              {pagination.pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handlePage(p)}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA AGENT — avec image
      ══════════════════════════════════════ */}
      <section className="home-cta">
        <div className="container home-cta-inner">
          <div className="cta-text">
            <h2>Vous avez un bien à louer ou à vendre ?</h2>
            <p>Rejoignez des centaines de propriétaires et agences qui font confiance à Démarcheur pour toucher des milliers d'acheteurs et locataires en Guinée.</p>
            <div className="cta-actions">
              <Link to="/inscription" className="btn btn-or btn-lg">Publier gratuitement →</Link>
              <Link to="/tarifs" className="btn btn-outline-white btn-lg">Voir les offres pro</Link>
            </div>
            <div className="cta-reassurance">
              <span>✓ Gratuit pour les particuliers</span>
              <span>✓ Activation sous 24h</span>
              <span>✓ Support dédié</span>
            </div>
          </div>
          <div className="cta-img-wrap">
            <img src={`${process.env.PUBLIC_URL}/images/hero-agent.jpg`} alt="Agent immobilier" className="cta-img" />
          </div>
        </div>
      </section>

    </div>
  );
}
