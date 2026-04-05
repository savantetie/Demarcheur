import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ListingDetail.css';

const LABELS_TYPE  = { 'location': 'Location', 'vente-maison': 'Vente', 'terrain': 'Terrain' };
const LABELS_LOGEMENT = { villa: 'Villa', appartement: 'Appartement', maison: 'Maison', duplex: 'Duplex', studio: 'Studio', chambre: 'Chambre(s)', immeuble: 'Immeuble' };
const LABELS_ETAT  = { neuf: 'Neuf / Récent', 'bon-etat': 'Bon état', 'a-renover': 'À rénover', inacheve: 'Inachevé / Gros œuvre' };
const LABELS_TF    = { tf: 'Titre Foncier (TF)', pf: 'Permis Foncier (PF)', 'lettre-attribution': "Lettre d'attribution", 'acte-vente': 'Acte de vente', 'non-titre': 'Non titré' };
const EQUIPEMENTS  = {
  edg: { label: 'Électricité EDG', icon: '⚡' }, seg: { label: 'Eau courante SEG', icon: '🚰' },
  groupe: { label: 'Groupe électrogène', icon: '🔋' }, citerne: { label: 'Citerne', icon: '🏗️' },
  fosse: { label: 'Fosse septique', icon: '♻️' }, puits: { label: 'Puits', icon: '💧' },
  clim: { label: 'Climatisation', icon: '❄️' }, cloture: { label: 'Clôture', icon: '🧱' },
  portail: { label: 'Portail / Garage', icon: '🚪' }, gardien: { label: 'Gardien', icon: '👮' },
  terrasse: { label: 'Terrasse', icon: '🪴' }, cuisine: { label: 'Cuisine équipée', icon: '🍳' },
  piscine: { label: 'Piscine', icon: '🏊' }, generatrice: { label: 'Générateur', icon: '🔌' },
};

const fmt = (p) => new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(p) + ' GNF';

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
      .then(res => {
        setAnnonce(res.data.annonce);
        // tracker la vue
        api.patch(`/analytics/listings/${id}/vue`).catch(() => {});
      })
      .catch(() => navigate('/'))
      .finally(() => setChargement(false));
  }, [id, navigate]);

  const handleMessage = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      await api.post(`/messages/annonce/${id}`, form);
      // tracker le contact
      api.patch(`/analytics/listings/${id}/contact`).catch(() => {});
      toast.success('Message envoyé !');
      setForm({ nomExpediteur: '', emailExpediteur: '', telephoneExpediteur: '', contenu: '' });
    } catch {
      toast.error("Erreur lors de l'envoi.");
    } finally { setEnvoi(false); }
  };

  if (chargement) return <div className="spinner-wrap"><div className="spinner"></div></div>;
  if (!annonce) return null;

  const nbPhotos = annonce.photos?.length || 0;
  const telNum = (annonce.whatsapp || annonce.proprietaire?.telephone || '').replace(/\D/g, '');
  const whatsappUrl = telNum
    ? `https://wa.me/${telNum.startsWith('224') ? telNum : '224' + telNum}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce sur Démarcheur : ${annonce.titre}`)}`
    : null;

  const prevPhoto = () => setPhotoIdx(i => (i - 1 + nbPhotos) % nbPhotos);
  const nextPhoto = () => setPhotoIdx(i => (i + 1) % nbPhotos);
  const isOwner = user && (user._id === annonce.proprietaire?._id || user.role === 'admin');

  const statut = annonce.statut;
  const isDisponible = statut === 'publie';

  return (
    <div className="detail-page container">

      {/* Fil d'ariane */}
      <div className="detail-breadcrumb">
        <Link to="/">Annonces</Link>
        <span>›</span>
        <span>{annonce.ville}</span>
        <span>›</span>
        <span>{LABELS_TYPE[annonce.type]}</span>
        <span>›</span>
        <span className="bc-current">{annonce.titre}</span>
      </div>

      {/* Badge boosté */}
      {annonce.featured && annonce.featuredExpiry && new Date(annonce.featuredExpiry) >= new Date() && (
        <div className="detail-boost-banner">
          ⭐ Annonce mise en avant — {annonce.featuredType === 'sponsorise' ? 'Sponsorisée' : annonce.featuredType === 'premium' ? 'Premium' : 'Top liste'}
        </div>
      )}

      <div className="detail-grid">
        {/* ── Colonne gauche ── */}
        <div className="detail-left">

          {/* Galerie */}
          <div className="galerie">
            <div className="galerie-main">
              {nbPhotos > 0 ? (
                <img src={annonce.photos[photoIdx]?.url} alt={annonce.titre} />
              ) : (
                <div className="galerie-placeholder">🏠<span>Pas de photo</span></div>
              )}

              <span className={`galerie-statut-badge statut-${statut}`}>
                {statut === 'publie' ? '✅ Disponible' : statut === 'loue' ? '🔑 Loué' : statut === 'vendu' ? '✅ Vendu' : 'En attente'}
              </span>

              {annonce.negotiable && <span className="galerie-nego-badge">💬 Négociable</span>}

              {nbPhotos > 1 && (
                <>
                  <div className="galerie-counter">{photoIdx + 1} / {nbPhotos}</div>
                  <div className="galerie-nav">
                    <button onClick={prevPhoto}>‹</button>
                    <button onClick={nextPhoto}>›</button>
                  </div>
                </>
              )}
            </div>

            {nbPhotos > 1 && (
              <div className="galerie-thumbs">
                {annonce.photos.map((p, i) => (
                  <img key={i} src={p.url} alt="" className={i === photoIdx ? 'active' : ''} onClick={() => setPhotoIdx(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Titre & Prix */}
          <div className="detail-card">
            <div className="detail-type-row">
              <span className={`detail-type-badge type-${annonce.type}`}>{LABELS_TYPE[annonce.type]}</span>
              {annonce.typeLogement && <span className="detail-logement-badge">{LABELS_LOGEMENT[annonce.typeLogement]}</span>}
              {annonce.typeMandat === 'exclusif' && <span className="detail-mandat-badge">🔒 Exclusif</span>}
            </div>
            <h1 className="detail-titre">{annonce.titre}</h1>
            <p className="detail-loc">
              📍 {annonce.quartier}{annonce.commune ? `, ${annonce.commune}` : ''}, {annonce.ville}
            </p>
            {annonce.repere && <p className="detail-repere">🗺️ {annonce.repere}</p>}
            <div className="detail-prix">
              {fmt(annonce.prix)}
              {annonce.type === 'location' && <span> /mois</span>}
              {annonce.negotiable && <span className="nego-tag">Négociable</span>}
            </div>
            {annonce.type === 'location' && annonce.caution > 0 && (
              <p className="detail-caution">Caution : {annonce.caution} mois ({fmt(annonce.prix * annonce.caution)})</p>
            )}
            {annonce.type === 'location' && annonce.chargesIncluses && (
              <p className="detail-charges">✓ Charges incluses (eau & électricité)</p>
            )}
          </div>

          {/* Caractéristiques chiffrées */}
          {(annonce.nbChambres || annonce.nbPieces || annonce.surface || annonce.surfaceTerrain || annonce.nbSDB) && (
            <div className="detail-card">
              <h3>Caractéristiques</h3>
              <div className="caract-grid">
                {annonce.surface && (
                  <div className="caract-item">
                    <span className="caract-icon">📐</span>
                    <span className="caract-val">{annonce.surface} m²</span>
                    <span className="caract-label">Surface</span>
                  </div>
                )}
                {annonce.surfaceTerrain && (
                  <div className="caract-item">
                    <span className="caract-icon">🌿</span>
                    <span className="caract-val">{annonce.surfaceTerrain} m²</span>
                    <span className="caract-label">Terrain</span>
                  </div>
                )}
                {annonce.nbChambres && (
                  <div className="caract-item">
                    <span className="caract-icon">🛏️</span>
                    <span className="caract-val">{annonce.nbChambres}</span>
                    <span className="caract-label">Chambres</span>
                  </div>
                )}
                {annonce.nbPieces && (
                  <div className="caract-item">
                    <span className="caract-icon">🏠</span>
                    <span className="caract-val">{annonce.nbPieces}</span>
                    <span className="caract-label">Pièces</span>
                  </div>
                )}
                {annonce.nbSDB && (
                  <div className="caract-item">
                    <span className="caract-icon">🚿</span>
                    <span className="caract-val">{annonce.nbSDB}</span>
                    <span className="caract-label">Salle de bain</span>
                  </div>
                )}
                {annonce.etage && (
                  <div className="caract-item">
                    <span className="caract-icon">🏢</span>
                    <span className="caract-val">{{ rdc: 'RDC', '1er': '1er', '2eme': '2ème', '3eme': '3ème', '4eme+': '4ème+' }[annonce.etage] || annonce.etage}</span>
                    <span className="caract-label">Étage</span>
                  </div>
                )}
                {annonce.etat && (
                  <div className="caract-item">
                    <span className="caract-icon">🔨</span>
                    <span className="caract-val" style={{ fontSize: '.75rem' }}>{LABELS_ETAT[annonce.etat]}</span>
                    <span className="caract-label">État</span>
                  </div>
                )}
                {annonce.titreFoncier && (
                  <div className="caract-item">
                    <span className="caract-icon">📜</span>
                    <span className="caract-val" style={{ fontSize: '.7rem' }}>{LABELS_TF[annonce.titreFoncier]}</span>
                    <span className="caract-label">Titre</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Équipements */}
          {annonce.equipements?.length > 0 && (
            <div className="detail-card">
              <h3>Équipements & Commodités</h3>
              <div className="equip-tags">
                {annonce.equipements.map(eq => (
                  EQUIPEMENTS[eq] && (
                    <span key={eq} className="equip-tag">
                      {EQUIPEMENTS[eq].icon} {EQUIPEMENTS[eq].label}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="detail-card">
            <h3>Description</h3>
            <p className="detail-description-text">{annonce.description}</p>
            {annonce.disponibilite && annonce.disponibilite !== 'immediate' && (
              <p className="detail-dispo">📅 Disponible à partir du {new Date(annonce.disponibilite).toLocaleDateString('fr-FR')}</p>
            )}
            {annonce.disponibilite === 'immediate' && <p className="detail-dispo-ok">✅ Disponible immédiatement</p>}
          </div>

          {/* Propriétaire — mobile */}
          <div className="detail-card detail-contact-mobile">
            <ContactBlock annonce={annonce} whatsappUrl={whatsappUrl} isDisponible={isDisponible} form={form} setForm={setForm} envoi={envoi} handleMessage={handleMessage} isOwner={isOwner} />
          </div>
        </div>

        {/* ── Colonne droite (sticky) ── */}
        <div className="detail-right">
          <div className="detail-sticky">
            <ContactBlock annonce={annonce} whatsappUrl={whatsappUrl} isDisponible={isDisponible} form={form} setForm={setForm} envoi={envoi} handleMessage={handleMessage} isOwner={isOwner} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactBlock({ annonce, whatsappUrl, isDisponible, form, setForm, envoi, handleMessage, isOwner }) {
  const fmt = (p) => new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(p) + ' GNF';

  return (
    <>
      {/* Prix récap */}
      <div className="contact-prix">
        <span className="contact-prix-val">{fmt(annonce.prix)}</span>
        {annonce.type === 'location' && <span className="contact-prix-unit">/mois</span>}
      </div>

      {/* Propriétaire */}
      <div className="proprietaire-block">
        <div className="prop-avatar">
          {annonce.proprietaire?.avatar
            ? <img src={annonce.proprietaire.avatar} alt="" />
            : <span>{(annonce.proprietaire?.nom || 'A')[0].toUpperCase()}</span>
          }
        </div>
        <div className="prop-info">
          <strong>{annonce.proprietaire?.nom}</strong>
          <span>{annonce.proprietaire?.agence?.nomEntreprise || (annonce.proprietaire?.role === 'agency' ? 'Agence' : 'Particulier')}</span>
        </div>
      </div>

      {isDisponible && (
        <div className="contact-btns">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-btn-wa">
              <span className="cbtn-icon">💬</span>
              <span className="cbtn-text">
                <span className="cbtn-label">WhatsApp</span>
                <span className="cbtn-num">{annonce.whatsapp || annonce.telephone}</span>
              </span>
            </a>
          )}
          {annonce.telephone && (
            <a href={`tel:${annonce.telephone}`} className="contact-btn-tel">
              <span className="cbtn-icon">📞</span>
              <span className="cbtn-text">
                <span className="cbtn-label">Appeler</span>
                <span className="cbtn-num">{annonce.telephone}</span>
              </span>
            </a>
          )}
        </div>
      )}

      {!isDisponible && (
        <div className="contact-indispo">
          Ce bien n'est plus disponible.
        </div>
      )}

      <div className="contact-separator"><span>ou laissez un message</span></div>

      <form onSubmit={handleMessage} className="contact-form">
        <input required placeholder="Votre nom *" value={form.nomExpediteur} onChange={e => setForm(f => ({ ...f, nomExpediteur: e.target.value }))} />
        <input type="email" required placeholder="Email *" value={form.emailExpediteur} onChange={e => setForm(f => ({ ...f, emailExpediteur: e.target.value }))} />
        <input type="tel" placeholder="Téléphone (optionnel)" value={form.telephoneExpediteur} onChange={e => setForm(f => ({ ...f, telephoneExpediteur: e.target.value }))} />
        <textarea required rows={3} placeholder="Je suis intéressé par ce bien, pouvez-vous me recontacter ?" value={form.contenu} onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))} />
        <button type="submit" className="btn btn-primary btn-full" disabled={envoi}>
          {envoi ? 'Envoi...' : '✉️ Envoyer le message'}
        </button>
      </form>

      {isOwner && (
        <div className="detail-owner-actions">
          <Link to={`/modifier-annonce/${annonce._id}`} className="btn btn-sm btn-secondary btn-full">⚙️ Modifier cette annonce</Link>
        </div>
      )}
    </>
  );
}
