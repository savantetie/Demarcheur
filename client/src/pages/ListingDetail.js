import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ListingDetail.css';

const LABELS = { 'location': 'Location', 'vente-maison': 'Vente maison', 'terrain': 'Terrain' };
const formaterPrix = (p) =>
  new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(p);

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [annonce, setAnnonce] = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [form, setForm] = useState({ nomExpediteur: '', emailExpediteur: '', telephoneExpediteur: '', contenu: '' });
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => setAnnonce(res.data.annonce))
      .catch(() => navigate('/'))
      .finally(() => setChargement(false));
  }, [id, navigate]);

  const handleMessage = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      await api.post(`/messages/annonce/${id}`, form);
      toast.success('Message envoyé avec succès !');
      setForm({ nomExpediteur: '', emailExpediteur: '', telephoneExpediteur: '', contenu: '' });
    } catch {
      toast.error('Erreur lors de l\'envoi du message.');
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) return <div className="spinner-wrap"><div className="spinner"></div></div>;
  if (!annonce) return null;

  const whatsappUrl = annonce.proprietaire?.telephone
    ? `https://wa.me/${annonce.proprietaire.telephone.replace(/\D/g, '')}?text=Bonjour, je suis intéressé par votre annonce : ${annonce.titre}`
    : null;

  return (
    <div className="page container">
      <Link to="/" className="retour">← Retour aux annonces</Link>

      <div className="detail-grid">
        {/* Galerie photos */}
        <div className="galerie">
          <div className="galerie-main">
            {annonce.photos.length > 0 ? (
              <img src={annonce.photos[photoIdx]?.url} alt={annonce.titre} />
            ) : (
              <div className="galerie-placeholder">Pas de photo</div>
            )}
            <span className={`badge badge-${annonce.statut} galerie-statut`}>
              {annonce.statut === 'en_attente' ? 'En attente' :
               annonce.statut === 'publie' ? 'Disponible' :
               annonce.statut === 'loue' ? 'Loué' :
               annonce.statut === 'vendu' ? 'Vendu' : 'Rejeté'}
            </span>
          </div>
          {annonce.photos.length > 1 && (
            <div className="galerie-thumbs">
              {annonce.photos.map((p, i) => (
                <img
                  key={i}
                  src={p.url}
                  alt={`Photo ${i + 1}`}
                  className={i === photoIdx ? 'active' : ''}
                  onClick={() => setPhotoIdx(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="detail-info">
          <div className="detail-header">
            <span className={`listing-type listing-type-${annonce.type}`}>{LABELS[annonce.type]}</span>
            <h1>{annonce.titre}</h1>
            <p className="detail-loc">📍 {annonce.quartier}, {annonce.ville}</p>
            <p className="detail-prix">
              {formaterPrix(annonce.prix)}
              {annonce.type === 'location' && <span> /mois</span>}
            </p>
          </div>

          <div className="detail-description">
            <h3>Description</h3>
            <p>{annonce.description}</p>
          </div>

          <div className="detail-contact">
            <h3>Contact</h3>
            <p>👤 {annonce.proprietaire?.nom}</p>
            <p>📞 {annonce.proprietaire?.telephone}</p>

            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-or btn-full" style={{ marginTop: '.75rem' }}>
                💬 Contacter sur WhatsApp
              </a>
            )}
          </div>

          {/* Formulaire de contact */}
          <div className="detail-form">
            <h3>Envoyer un message</h3>
            <form onSubmit={handleMessage}>
              <div className="form-group">
                <label>Votre nom</label>
                <input required value={form.nomExpediteur} onChange={e => setForm(f => ({ ...f, nomExpediteur: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={form.emailExpediteur} onChange={e => setForm(f => ({ ...f, emailExpediteur: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Téléphone (optionnel)</label>
                <input value={form.telephoneExpediteur} onChange={e => setForm(f => ({ ...f, telephoneExpediteur: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea required value={form.contenu} onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={envoi}>
                {envoi ? 'Envoi...' : 'Envoyer le message'}
              </button>
            </form>
          </div>

          {/* Actions propriétaire */}
          {user && (user._id === annonce.proprietaire?._id || user.role === 'admin') && (
            <div className="detail-actions">
              <Link to={`/modifier-annonce/${annonce._id}`} className="btn btn-secondary">Modifier</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
