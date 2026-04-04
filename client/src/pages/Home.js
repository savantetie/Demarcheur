import React, { useState, useEffect, useCallback } from 'react';
import ListingCard from '../components/ListingCard';
import FilterBar from '../components/FilterBar';
import api from '../utils/api';
import './Home.css';

export default function Home() {
  const [annonces, setAnnonces] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [filtres, setFiltres] = useState({});

  const charger = useCallback(async (params = {}, page = 1) => {
    setChargement(true);
    try {
      const query = new URLSearchParams({ ...params, page, limite: 12 });
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
    charger(clean, 1);
  };

  const handlePage = (p) => {
    charger(filtres, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <h1>Trouvez votre bien immobilier en Guinée</h1>
          <p>Maisons, terrains et locations à Conakry et dans tout le pays</p>
        </div>
      </div>

      <div className="container">
        <FilterBar onFiltrer={handleFiltrer} />

        <div className="home-header">
          <h2 className="page-titre">
            {pagination.total} annonce{pagination.total !== 1 ? 's' : ''} disponible{pagination.total !== 1 ? 's' : ''}
          </h2>
        </div>

        {chargement ? (
          <div className="spinner-wrap"><div className="spinner"></div></div>
        ) : annonces.length === 0 ? (
          <div className="vide">
            <p>🏗️ Aucune annonce ne correspond à vos critères.</p>
          </div>
        ) : (
          <>
            <div className="grille-annonces">
              {annonces.map(a => <ListingCard key={a._id} annonce={a} />)}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handlePage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
