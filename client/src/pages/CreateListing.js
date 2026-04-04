import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './ListingForm.css';

const VILLES = ['Conakry', 'Kindia', 'Labé', 'Kankan', 'Nzérékoré', 'Boké', 'Mamou', 'Faranah', 'Siguiri'];

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titre: '', type: 'location', prix: '', quartier: '', ville: 'Conakry',
    description: '', telephone: '', whatsapp: '',
  });
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [chargement, setChargement] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre || !form.prix || !form.quartier || !form.description) {
      return toast.error('Veuillez remplir tous les champs obligatoires.');
    }
    setChargement(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      photos.forEach(p => data.append('photos', p));
      await api.post('/listings', data);
      toast.success('Annonce soumise ! Elle sera publiée après validation.');
      navigate('/tableau-de-bord');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="page container">
      <h1 className="page-titre">Nouvelle annonce</h1>

      <form className="listing-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Informations du bien</h2>
          <div className="form-group">
            <label>Titre *</label>
            <input required placeholder="Ex: Belle villa à Kipé, 4 chambres" value={form.titre} onChange={set('titre')} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type de bien *</label>
              <select value={form.type} onChange={set('type')}>
                <option value="location">Location</option>
                <option value="vente-maison">Vente maison</option>
                <option value="terrain">Terrain</option>
              </select>
            </div>
            <div className="form-group">
              <label>Prix (GNF) *{form.type === 'location' && ' / mois'}</label>
              <input type="number" required min={0} value={form.prix} onChange={set('prix')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ville *</label>
              <select value={form.ville} onChange={set('ville')}>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quartier *</label>
              <input required placeholder="Ex: Kipé, Ratoma..." value={form.quartier} onChange={set('quartier')} />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea required placeholder="Décrivez le bien : surface, état, équipements, accès..." value={form.description} onChange={set('description')} />
          </div>
        </div>

        <div className="form-section">
          <h2>Contact</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Téléphone</label>
              <input type="tel" placeholder="+224 XXX XXX XXX" value={form.telephone} onChange={set('telephone')} />
            </div>
            <div className="form-group">
              <label>WhatsApp</label>
              <input type="tel" placeholder="+224 XXX XXX XXX" value={form.whatsapp} onChange={set('whatsapp')} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Photos (max 8)</h2>
          <div className="form-group">
            <label>Sélectionner des photos</label>
            <input type="file" multiple accept="image/*" onChange={handlePhotos} className="input-file" />
          </div>
          {previews.length > 0 && (
            <div className="photo-previews">
              {previews.map((url, i) => (
                <img key={i} src={url} alt={`Photo ${i + 1}`} />
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Annuler</button>
          <button type="submit" className="btn btn-primary" disabled={chargement}>
            {chargement ? 'Publication en cours...' : 'Soumettre l\'annonce'}
          </button>
        </div>
      </form>
    </div>
  );
}
