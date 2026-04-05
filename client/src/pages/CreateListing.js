import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ListingForm.css';

// ── Données Guinée ────────────────────────────────────────────
const VILLES = ['Conakry', 'Kindia', 'Labé', 'Kankan', 'Nzérékoré', 'Boké', 'Mamou', 'Faranah', 'Siguiri', 'Coyah', 'Dubréka', 'Fria', 'Guéckédou', 'Kissidougou'];
const COMMUNES_CONAKRY = ['Kaloum', 'Dixinn', 'Matam', 'Ratoma', 'Matoto'];
const QUARTIERS_CONAKRY = [
  'Hamdallaye', 'Kipé', 'Ratoma', 'Bambeto', 'Cosa', 'Wanindara', 'Nongo',
  'Lambanyi', 'Yimbaya', 'Sonfonia', 'Kagbelen', 'Simbaya', 'Gbessia',
  'Enco-5', 'Kobaya', 'Koloma', 'Dabompa', 'T7', 'T8', 'Yattayah',
  'Almamya', 'Boulbinet', 'Sandervalia', 'Khouléfoundou', 'Matam Centre',
  'Dixinn Centre', 'Belle-Vue', 'Cameroun', 'Donka',
];

const EQUIPEMENTS_LIST = [
  { id: 'edg',       label: 'Électricité EDG',        icon: '⚡' },
  { id: 'seg',       label: 'Eau courante SEG',        icon: '🚰' },
  { id: 'groupe',    label: 'Groupe électrogène',      icon: '🔋' },
  { id: 'citerne',   label: 'Citerne / Château d\'eau',icon: '🏗️' },
  { id: 'fosse',     label: 'Fosse septique',          icon: '♻️' },
  { id: 'puits',     label: 'Puits',                   icon: '💧' },
  { id: 'clim',      label: 'Climatisation',           icon: '❄️' },
  { id: 'cloture',   label: 'Clôture / Mur',           icon: '🧱' },
  { id: 'portail',   label: 'Portail / Garage',        icon: '🚪' },
  { id: 'gardien',   label: 'Gardien / Vigile',        icon: '👮' },
  { id: 'terrasse',  label: 'Terrasse / Balcon',       icon: '🪴' },
  { id: 'cuisine',   label: 'Cuisine équipée',         icon: '🍳' },
  { id: 'piscine',   label: 'Piscine',                 icon: '🏊' },
  { id: 'generatrice', label: 'Générateur partagé',   icon: '🔌' },
];

const fmt = (n) => n ? new Intl.NumberFormat('fr-GN').format(n) + ' GNF' : '';

// ── Composant principal ───────────────────────────────────────
export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAgence = user?.role === 'agency' || user?.role === 'admin';

  const [form, setForm] = useState({
    type: '',
    typeLogement: '',
    titre: '',
    ville: 'Conakry',
    commune: '',
    quartier: '',
    repere: '',
    surface: '',
    surfaceTerrain: '',
    nbChambres: '',
    nbPieces: '',
    nbSDB: '',
    etage: '',
    etat: '',
    titreFoncier: '',
    equipements: [],
    prix: '',
    negotiable: false,
    caution: '',
    chargesIncluses: false,
    disponibilite: 'immediate',
    description: '',
    telephone: user?.telephone || '',
    whatsapp: user?.telephone || '',
    refInterne: '',
    typeMandat: '',
  });

  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [chargement, setChargement] = useState(false);
  const fileRef = useRef();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => () => setForm(f => ({ ...f, [k]: !f[k] }));

  const toggleEquipement = (id) => {
    setForm(f => ({
      ...f,
      equipements: f.equipements.includes(id)
        ? f.equipements.filter(e => e !== id)
        : [...f.equipements, id],
    }));
  };

  const addPhotos = (files) => {
    const arr = Array.from(files).slice(0, 8 - photos.length);
    if (arr.length === 0) return;
    setPhotos(p => [...p, ...arr]);
    setPreviews(p => [...p, ...arr.map(f => URL.createObjectURL(f))]);
  };

  const removePhoto = (i) => {
    setPhotos(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addPhotos(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type) return toast.error('Choisissez un type de bien.');
    if (!form.titre || !form.prix || !form.quartier || !form.description) {
      return toast.error('Veuillez remplir tous les champs obligatoires (*).');
    }
    setChargement(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'equipements') {
          v.forEach(eq => data.append('equipements', eq));
        } else {
          data.append(k, v);
        }
      });
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

  const prixFormate = form.prix ? fmt(Number(form.prix)) : '';

  return (
    <div className="lf-page">
      <div className="lf-container">

        {/* ── En-tête ── */}
        <div className="lf-header">
          <div>
            <h1>{isAgence ? '📋 Nouvelle annonce professionnelle' : '🏠 Publier une annonce'}</h1>
            <p className="lf-subtitle">
              {isAgence
                ? `Compte agence · ${user?.agence?.nomEntreprise}`
                : 'Compte particulier · Gratuit jusqu\'à 3 annonces'}
            </p>
          </div>
          {!isAgence && (
            <div className="lf-particulier-banner">
              <strong>Publication gratuite</strong>
              <span>Passez compte agence pour illimité</span>
              <Link to="/inscription/agence" className="btn btn-sm btn-outline">Devenir pro</Link>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="lf-form">

          {/* ══════════════════════════════════════
              SECTION 1 — TYPE DE BIEN
          ══════════════════════════════════════ */}
          <div className="lf-section">
            <div className="lf-section-title">
              <span className="lf-num">1</span>
              <div>
                <h2>Type de transaction</h2>
                <p>Que proposez-vous ?</p>
              </div>
            </div>

            <div className="type-cards">
              {[
                { id: 'location',    icon: '🔑', label: 'Location',          sub: 'Loyer mensuel' },
                { id: 'vente-maison',icon: '🏘️', label: 'Vente Maison/Villa', sub: 'Cession définitive' },
                { id: 'terrain',     icon: '🌿', label: 'Terrain / Parcelle', sub: 'Lot à bâtir' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`type-card ${form.type === t.id ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, type: t.id, typeLogement: '' }))}
                >
                  <span className="tc-icon">{t.icon}</span>
                  <span className="tc-label">{t.label}</span>
                  <span className="tc-sub">{t.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {form.type && <>

          {/* ══════════════════════════════════════
              SECTION 2 — LOCALISATION
          ══════════════════════════════════════ */}
          <div className="lf-section">
            <div className="lf-section-title">
              <span className="lf-num">2</span>
              <div><h2>Localisation</h2><p>Où se trouve le bien ?</p></div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Ville <span className="req">*</span></label>
                <select value={form.ville} onChange={set('ville')}>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {form.ville === 'Conakry' && (
                <div className="form-group">
                  <label>Commune</label>
                  <select value={form.commune} onChange={set('commune')}>
                    <option value="">Toutes communes</option>
                    {COMMUNES_CONAKRY.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Quartier <span className="req">*</span></label>
                {form.ville === 'Conakry' ? (
                  <select value={form.quartier} onChange={set('quartier')} required>
                    <option value="">Sélectionner le quartier</option>
                    {QUARTIERS_CONAKRY.map(q => <option key={q} value={q}>{q}</option>)}
                    <option value="Autre">Autre quartier</option>
                  </select>
                ) : (
                  <input required placeholder="Ex: Centre-ville, Quartier Madina..." value={form.quartier} onChange={set('quartier')} />
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '.75rem' }}>
              <label>Repère / Description de l'accès</label>
              <input
                placeholder="Ex: Près de la grande mosquée, derrière le marché central, 2ème entrée à droite..."
                value={form.repere}
                onChange={set('repere')}
              />
              <small>Aide les acheteurs à localiser le bien facilement</small>
            </div>
          </div>

          {/* ══════════════════════════════════════
              SECTION 3 — CARACTÉRISTIQUES
          ══════════════════════════════════════ */}
          <div className="lf-section">
            <div className="lf-section-title">
              <span className="lf-num">3</span>
              <div><h2>Caractéristiques du bien</h2><p>Décrivez votre bien avec précision</p></div>
            </div>

            {/* Type de logement (pas pour terrain) */}
            {form.type !== 'terrain' && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Type de logement <span className="req">*</span></label>
                <div className="logement-grid">
                  {[
                    { id: 'villa',       label: '🏰 Villa' },
                    { id: 'appartement', label: '🏢 Appartement' },
                    { id: 'maison',      label: '🏠 Maison' },
                    { id: 'duplex',      label: '🏗️ Duplex' },
                    { id: 'studio',      label: '🛏️ Studio' },
                    { id: 'chambre',     label: '🚪 Chambre(s)' },
                    { id: 'immeuble',    label: '🏬 Immeuble' },
                  ].map(l => (
                    <button
                      key={l.id}
                      type="button"
                      className={`logement-btn ${form.typeLogement === l.id ? 'active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, typeLogement: l.id }))}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Titre de l'annonce <span className="req">*</span></label>
              <input
                required
                placeholder={
                  form.type === 'terrain'
                    ? 'Ex: Terrain 500m² à Kipé, titre foncier disponible'
                    : form.typeLogement === 'villa'
                    ? 'Ex: Belle villa F5 avec piscine à Hamdallaye'
                    : 'Ex: Maison 4 chambres à louer à Ratoma, eau & électricité'
                }
                value={form.titre}
                onChange={set('titre')}
                maxLength={100}
              />
              <small>{form.titre.length}/100 caractères</small>
            </div>

            {/* Champs numériques */}
            {form.type !== 'terrain' ? (
              <div className="form-grid-4">
                <div className="form-group">
                  <label>Chambres</label>
                  <select value={form.nbChambres} onChange={set('nbChambres')}>
                    <option value="">—</option>
                    {[1,2,3,4,5,6,7,8,'9+'].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                {isAgence && <>
                  <div className="form-group">
                    <label>Pièces totales</label>
                    <select value={form.nbPieces} onChange={set('nbPieces')}>
                      <option value="">—</option>
                      {[1,2,3,4,5,6,7,8,9,10,'10+'].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Salles de bain</label>
                    <select value={form.nbSDB} onChange={set('nbSDB')}>
                      <option value="">—</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Surface (m²)</label>
                    <input type="number" min={0} placeholder="Ex: 120" value={form.surface} onChange={set('surface')} />
                  </div>
                </>}
              </div>
            ) : (
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Superficie (m²) {isAgence && <span className="req">*</span>}</label>
                  <input type="number" min={0} placeholder="Ex: 500" value={form.surfaceTerrain} onChange={set('surfaceTerrain')} />
                </div>
                <div className="form-group">
                  <label>Titre foncier</label>
                  <select value={form.titreFoncier} onChange={set('titreFoncier')}>
                    <option value="">Non précisé</option>
                    <option value="tf">Titre Foncier (TF)</option>
                    <option value="pf">Permis Foncier (PF)</option>
                    <option value="lettre-attribution">Lettre d'attribution</option>
                    <option value="acte-vente">Acte de vente notarié</option>
                    <option value="non-titre">Non titré</option>
                  </select>
                </div>
              </div>
            )}

            {isAgence && form.type !== 'terrain' && (
              <div className="form-grid-3" style={{ marginTop: '.75rem' }}>
                <div className="form-group">
                  <label>Étage</label>
                  <select value={form.etage} onChange={set('etage')}>
                    <option value="">—</option>
                    <option value="rdc">Rez-de-chaussée (RDC)</option>
                    <option value="1er">1er étage</option>
                    <option value="2eme">2ème étage</option>
                    <option value="3eme">3ème étage</option>
                    <option value="4eme+">4ème et plus</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>État du bien</label>
                  <select value={form.etat} onChange={set('etat')}>
                    <option value="">—</option>
                    <option value="neuf">Neuf / Récent</option>
                    <option value="bon-etat">Bon état</option>
                    <option value="a-renover">À rénover</option>
                    <option value="inacheve">Inachevé / Gros œuvre</option>
                  </select>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Description détaillée <span className="req">*</span></label>
              <textarea
                required
                rows={isAgence ? 6 : 5}
                placeholder={
                  isAgence
                    ? `Décrivez le bien en détail :\n• Caractéristiques principales\n• Matériaux de construction\n• État des finitions\n• Environnement et commodités\n• Conditions de location/vente`
                    : 'Décrivez votre bien : surface approximative, état, équipements disponibles, accès, conditions...'
                }
                value={form.description}
                onChange={set('description')}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════
              SECTION 4 — ÉQUIPEMENTS (agence uniquement)
          ══════════════════════════════════════ */}
          {isAgence && (
            <div className="lf-section">
              <div className="lf-section-title">
                <span className="lf-num">4</span>
                <div><h2>Équipements & Commodités</h2><p>Cochez tout ce qui est disponible</p></div>
              </div>

              <div className="equip-grid">
                {EQUIPEMENTS_LIST.map(eq => (
                  <button
                    key={eq.id}
                    type="button"
                    className={`equip-btn ${form.equipements.includes(eq.id) ? 'active' : ''}`}
                    onClick={() => toggleEquipement(eq.id)}
                  >
                    <span className="equip-icon">{eq.icon}</span>
                    <span className="equip-label">{eq.label}</span>
                    {form.equipements.includes(eq.id) && <span className="equip-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              SECTION 5 — PRIX & CONDITIONS
          ══════════════════════════════════════ */}
          <div className="lf-section">
            <div className="lf-section-title">
              <span className="lf-num">{isAgence ? '5' : '4'}</span>
              <div><h2>Prix & Conditions</h2><p>Prix en Francs Guinéens (GNF)</p></div>
            </div>

            <div className="prix-block">
              <div className="form-group prix-input-wrap">
                <label>
                  Prix (GNF){form.type === 'location' ? ' / mois' : ''} <span className="req">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  placeholder={form.type === 'terrain' ? 'Ex: 50000000' : form.type === 'location' ? 'Ex: 3000000' : 'Ex: 500000000'}
                  value={form.prix}
                  onChange={set('prix')}
                  className="prix-input"
                />
                {prixFormate && <span className="prix-preview">{prixFormate}</span>}
              </div>

              <div className="form-group">
                <label className="toggle-label">
                  <button type="button" className={`toggle-btn ${form.negotiable ? 'on' : ''}`} onClick={toggle('negotiable')}>
                    <span className="toggle-knob" />
                  </button>
                  Prix négociable
                </label>
              </div>
            </div>

            {form.type === 'location' && (
              <div className="form-grid-3" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Caution (nombre de mois)</label>
                  <select value={form.caution} onChange={set('caution')}>
                    <option value="0">Aucune caution</option>
                    <option value="1">1 mois</option>
                    <option value="2">2 mois</option>
                    <option value="3">3 mois</option>
                    <option value="6">6 mois</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="toggle-label" style={{ marginTop: '1.6rem' }}>
                    <button type="button" className={`toggle-btn ${form.chargesIncluses ? 'on' : ''}`} onClick={toggle('chargesIncluses')}>
                      <span className="toggle-knob" />
                    </button>
                    Charges incluses (eau, électricité)
                  </label>
                </div>
              </div>
            )}

            {isAgence && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Disponibilité</label>
                <div className="dispo-btns">
                  <button type="button" className={`dispo-btn ${form.disponibilite === 'immediate' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, disponibilite: 'immediate' }))}>
                    ✅ Disponible immédiatement
                  </button>
                  <button type="button" className={`dispo-btn ${form.disponibilite !== 'immediate' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, disponibilite: '' }))}>
                    📅 À partir d'une date
                  </button>
                </div>
                {form.disponibilite !== 'immediate' && (
                  <input type="date" value={form.disponibilite} onChange={set('disponibilite')} style={{ marginTop: '.5rem' }} />
                )}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════
              SECTION 6 — CONTACT
          ══════════════════════════════════════ */}
          <div className="lf-section">
            <div className="lf-section-title">
              <span className="lf-num">{isAgence ? '6' : '5'}</span>
              <div><h2>Contact</h2><p>Comment vous joindre pour ce bien</p></div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Téléphone <span className="req">*</span></label>
                <input type="tel" required placeholder="Ex: 621 23 45 67" value={form.telephone} onChange={set('telephone')} />
                <small>Numéro Guinée (+224)</small>
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input type="tel" placeholder="Ex: 621 23 45 67" value={form.whatsapp} onChange={set('whatsapp')} />
                <small>Laissez vide si identique au téléphone</small>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              SECTION 7 — PHOTOS
          ══════════════════════════════════════ */}
          <div className="lf-section">
            <div className="lf-section-title">
              <span className="lf-num">{isAgence ? '7' : '6'}</span>
              <div><h2>Photos</h2><p>Jusqu'à 8 photos · La 1ère sera la photo principale</p></div>
            </div>

            {/* Zone drop */}
            <div
              className={`photo-drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={e => addPhotos(e.target.files)} style={{ display: 'none' }} />
              {dragOver ? (
                <p className="drop-hint active">Déposez vos photos ici</p>
              ) : (
                <>
                  <span className="drop-icon">📷</span>
                  <p className="drop-hint">Cliquez ou glissez vos photos ici</p>
                  <p className="drop-sub">JPG, PNG, WEBP · Max 8 photos · 10 Mo par photo</p>
                </>
              )}
            </div>

            {previews.length > 0 && (
              <div className="photo-grid">
                {previews.map((url, i) => (
                  <div key={i} className={`photo-thumb ${i === 0 ? 'main' : ''}`}>
                    <img src={url} alt={`Photo ${i + 1}`} />
                    {i === 0 && <span className="photo-main-label">Principale</span>}
                    <button type="button" className="photo-remove" onClick={() => removePhoto(i)}>✕</button>
                  </div>
                ))}
                {photos.length < 8 && (
                  <div className="photo-add-more" onClick={() => fileRef.current?.click()}>
                    <span>+</span>
                    <span>Ajouter</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════
              SECTION 8 — INFOS AGENCE
          ══════════════════════════════════════ */}
          {isAgence && (
            <div className="lf-section lf-section-agence">
              <div className="lf-section-title">
                <span className="lf-num">8</span>
                <div><h2>Informations agence</h2><p>Usage interne et gestion du mandat</p></div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Référence interne</label>
                  <input placeholder="Ex: AGN-2024-001" value={form.refInterne} onChange={set('refInterne')} />
                  <small>Votre référence de dossier (non visible par les clients)</small>
                </div>
                <div className="form-group">
                  <label>Type de mandat</label>
                  <div className="mandat-btns">
                    {[
                      { id: 'simple',   label: '📝 Mandat simple',   sub: 'Plusieurs agences' },
                      { id: 'exclusif', label: '🔒 Mandat exclusif', sub: 'Vous seul' },
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        className={`mandat-btn ${form.typeMandat === m.id ? 'active' : ''}`}
                        onClick={() => setForm(f => ({ ...f, typeMandat: f.typeMandat === m.id ? '' : m.id }))}
                      >
                        <span>{m.label}</span>
                        <small>{m.sub}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              ACTIONS
          ══════════════════════════════════════ */}
          <div className="lf-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary lf-submit" disabled={chargement || !form.type}>
              {chargement
                ? <><span className="spinner-sm" /> Publication en cours...</>
                : '✓ Soumettre l\'annonce'}
            </button>
          </div>

          <p className="lf-disclaimer">
            Votre annonce sera examinée par notre équipe avant publication, généralement sous 24h.
          </p>

          </>}
        </form>
      </div>
    </div>
  );
}
