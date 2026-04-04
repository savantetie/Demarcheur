import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './ListingForm.css';

const VILLES = ['Conakry', 'Kindia', 'Labé', 'Kankan', 'Nzérékoré', 'Boké', 'Mamou', 'Faranah', 'Siguiri'];

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [sauvegarde, setSauvegarde] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => {
        const a = res.data.annonce;
        setForm({ titre: a.titre, type: a.type, prix: a.prix, quartier: a.quartier, ville: a.ville, description: a.description, telephone: a.telephone || '', whatsapp: a.whatsapp || '' });
        setPreviews(a.photos.map(p => p.url));
      })
      .catch(() => navigate('/tableau-de-bord'))
      .finally(() => setChargement(false));
  }, [id, navigate]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSauvegarde(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      photos.forEach(p => data.append('photos', p));
      await api.put(`/listings/${id}`, data);
      toast.success('Annonce modifiée. En attente de revalidation.');
      navigate('/tableau-de-bord');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setSauvegarde(false);
    }
  };

  if (chargement || !form) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="page container">
      <h1 className="page-titre">Modifier l'annonce</h1>

      <form className="listing-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Informations du bien</h2>
          <div className="form-group">
            <label>Titre *</label>
            <input required value={form.titre} onChange={set('titre')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select value={form.type} onChange={set('type')}>
                <option value="location">Location</option>
                <option value="vente-maison">Vente maison</option>
                <option value="terrain">Terrain</option>
              </select>
            </div>
            <div className="form-group">
              <label>Prix (GNF) *</label>
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
              <input required value={form.quartier} onChange={set('quartier')} />
            </div>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea required value={form.description} onChange={set('description')} />
          </div>
        </div>

        <div className="form-section">
          <h2>Contact</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Téléphone</label>
              <input type="tel" value={form.telephone} onChange={set('telephone')} />
            </div>
            <div className="form-group">
              <label>WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={set('whatsapp')} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Remplacer les photos (optionnel)</h2>
          <div className="form-group">
            <input type="file" multiple accept="image/*" onChange={handlePhotos} className="input-file" />
          </div>
          {previews.length > 0 && (
            <div className="photo-previews">
              {previews.map((url, i) => <img key={i} src={url} alt={`Photo ${i + 1}`} />)}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Annuler</button>
          <button type="submit" className="btn btn-primary" disabled={sauvegarde}>
            {sauvegarde ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
