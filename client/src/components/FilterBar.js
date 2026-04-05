import React, { useState } from 'react';
import './FilterBar.css';

const VILLES = ['Conakry', 'Kindia', 'Labé', 'Kankan', 'Nzérékoré', 'Boké', 'Mamou', 'Faranah', 'Siguiri'];

export default function FilterBar({ onFiltrer }) {
  const [filtres, setFiltres] = useState({ type: '', ville: '', quartier: '', prixMin: '', prixMax: '' });

  const handleChange = (e) => setFiltres(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => { e.preventDefault(); onFiltrer(filtres); };

  const handleReset = () => {
    const vide = { type: '', ville: '', quartier: '', prixMin: '', prixMax: '' };
    setFiltres(vide);
    onFiltrer(vide);
  };

  return (
    <form className="filterbar" onSubmit={handleSubmit}>
      <div className="filterbar-group">
        <label>Type de bien</label>
        <select name="type" value={filtres.type} onChange={handleChange}>
          <option value="">Tous les types</option>
          <option value="location">Location</option>
          <option value="vente-maison">Vente maison</option>
          <option value="terrain">Terrain</option>
        </select>
      </div>

      <div className="filterbar-divider" />

      <div className="filterbar-group">
        <label>Ville</label>
        <select name="ville" value={filtres.ville} onChange={handleChange}>
          <option value="">Toutes les villes</option>
          {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div className="filterbar-group">
        <label>Quartier</label>
        <input name="quartier" placeholder="Ex: Kipé, Ratoma..." value={filtres.quartier} onChange={handleChange} />
      </div>

      <div className="filterbar-divider" />

      <div className="filterbar-group">
        <label>Prix min (GNF)</label>
        <input type="number" name="prixMin" placeholder="0" value={filtres.prixMin} onChange={handleChange} />
      </div>

      <div className="filterbar-group">
        <label>Prix max (GNF)</label>
        <input type="number" name="prixMax" placeholder="Sans limite" value={filtres.prixMax} onChange={handleChange} />
      </div>

      <div className="filterbar-actions">
        <button type="submit" className="btn btn-primary">🔍 Rechercher</button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>Effacer</button>
      </div>
    </form>
  );
}
