import React, { useState } from 'react';
import './FilterBar.css';

const VILLES = ['Conakry', 'Kindia', 'Labé', 'Kankan', 'Nzérékoré', 'Boké', 'Mamou', 'Faranah', 'Siguiri'];

export default function FilterBar({ onFiltrer }) {
  const [filtres, setFiltres] = useState({
    type: '', ville: '', quartier: '', prixMin: '', prixMax: '',
  });

  const handleChange = (e) => {
    setFiltres(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFiltrer(filtres);
  };

  const handleReset = () => {
    const vide = { type: '', ville: '', quartier: '', prixMin: '', prixMax: '' };
    setFiltres(vide);
    onFiltrer(vide);
  };

  return (
    <form className="filterbar" onSubmit={handleSubmit}>
      <select name="type" value={filtres.type} onChange={handleChange}>
        <option value="">Tous les types</option>
        <option value="location">Location</option>
        <option value="vente-maison">Vente maison</option>
        <option value="terrain">Terrain</option>
      </select>

      <select name="ville" value={filtres.ville} onChange={handleChange}>
        <option value="">Toutes les villes</option>
        {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
      </select>

      <input
        name="quartier"
        placeholder="Quartier..."
        value={filtres.quartier}
        onChange={handleChange}
      />

      <input
        type="number"
        name="prixMin"
        placeholder="Prix min (GNF)"
        value={filtres.prixMin}
        onChange={handleChange}
      />

      <input
        type="number"
        name="prixMax"
        placeholder="Prix max (GNF)"
        value={filtres.prixMax}
        onChange={handleChange}
      />

      <div className="filterbar-actions">
        <button type="submit" className="btn btn-primary btn-sm">Filtrer</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>Réinitialiser</button>
      </div>
    </form>
  );
}
