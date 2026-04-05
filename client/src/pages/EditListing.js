import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ListingForm.css';

const VILLES = ['Conakry', 'Kindia', 'Labé', 'Kankan', 'Nzérékoré', 'Boké', 'Mamou', 'Faranah', 'Siguiri', 'Coyah', 'Dubréka', 'Fria', 'Guéckédou', 'Kissidougou'];
const COMMUNES_CONAKRY = ['Kaloum', 'Dixinn', 'Matam', 'Ratoma', 'Matoto'];
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

export default function EditListing() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAgence = user?.role === 'agency' || user?.role === 'admin';
  const fileRef = useRef();

  const [form, setForm] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [photosExistantes, setPhotosExistantes] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => {
        const a = res.data.annonce;
        setForm({
          type: a.type || 'location',
          typeLogement: a.typeLogement || '',
          titre: a.titre || '',
          ville: a.ville || 'Conakry',
          commune: a.commune || '',
          quartier: a.quartier || '',
          repere: a.repere || '',
          surface: a.surface || '',
          surfaceTerrain: a.surfaceTerrain || '',
          nbChambres: a.nbChambres || '',
          nbPieces: a.nbPieces || '',
          nbSDB: a.nbSDB || '',
          etage: a.etage || '',
          etat: a.etat || '',
          titreFoncier: a.titreFoncier || '',
          equipements: a.equipements || [],
          prix: a.prix || '',
          negotiable: a.negotiable || false,
          caution: a.caution || '',
          chargesIncluses: a.chargesIncluses || false,
          disponibilite: a.disponibilite || 'immediate',
          description: a.description || '',
          telephone: a.telephone || user?.telephone || '',
          whatsapp: a.whatsapp || user?.telephone || '',
          refInterne: a.refInterne || '',
          typeMandat: a.typeMandat || '',
        });
        setPhotosExistantes(a.photos || []);
        setPreviews([]);
      })
      .catch(() => navigate('/tableau-de-bord'))
      .finally(() => setChargement(false));
  }, [id, navigate, user]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => () => setForm(f => ({ ...f, [k]: !f[k] }));
  const toggleEquipement = (eqId) => {
    setForm(f => ({
      ...f,
      equipements: f.equipements.includes(eqId)
        ? f.equipements.filter(e => e !== eqId)
        : [...f.equipements, eqId],
    }));
  };

  const addPhotos = (files) => {
    const arr = Array.from(files).slice(0, 8 - photos.length);
    setPhotos(p => [...p, ...arr]);
    setPreviews(p => [...p, ...arr.map(f => URL.createObjectURL(f))]);
  };
  const removeNew = (i) => { setPhotos(p => p.filter((_, idx) => idx !== i)); setPreviews(p => p.filter((_, idx) => idx !== i)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSauvegarde(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'equipements') v.forEach(eq => data.append('equipements', eq));
        else data.append(k, v);
      });
      photos.forEach(p => data.append('photos', p));
      await api.put(`/listings/${id}`, data);
      toast.success('Annonce modifiée. En attente de revalidation.');
      navigate('/tableau-de-bord');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur.');
    } finally { setSauvegarde(false); }
  };

  if (chargement || !form) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  const prixFormate = form.prix ? fmt(Number(form.prix)) : '';

  return (
    <div className="lf-page">
      <div className="lf-container">
        <div className="lf-header">
          <div>
            <h1>✏️ Modifier l'annonce</h1>
            <p className="lf-subtitle">Les modifications repasseront en validation avant publication</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lf-form">

          {/* Type */}
          <div className="lf-section">
            <div className="lf-section-title"><span className="lf-num">1</span><div><h2>Type de transaction</h2></div></div>
            <div className="type-cards">
              {[
                { id: 'location',    icon: '🔑', label: 'Location',          sub: 'Loyer mensuel' },
                { id: 'vente-maison',icon: '🏘️', label: 'Vente Maison/Villa', sub: 'Cession définitive' },
                { id: 'terrain',     icon: '🌿', label: 'Terrain / Parcelle', sub: 'Lot à bâtir' },
              ].map(t => (
                <button key={t.id} type="button" className={`type-card ${form.type === t.id ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, type: t.id }))}>
                  <span className="tc-icon">{t.icon}</span>
                  <span className="tc-label">{t.label}</span>
                  <span className="tc-sub">{t.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Localisation */}
          <div className="lf-section">
            <div className="lf-section-title"><span className="lf-num">2</span><div><h2>Localisation</h2></div></div>
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
                <input required value={form.quartier} onChange={set('quartier')} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '.75rem' }}>
              <label>Repère / Accès</label>
              <input placeholder="Ex: Près de la mosquée..." value={form.repere} onChange={set('repere')} />
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="lf-section">
            <div className="lf-section-title"><span className="lf-num">3</span><div><h2>Caractéristiques</h2></div></div>

            {form.type !== 'terrain' && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Type de logement</label>
                <div className="logement-grid">
                  {[
                    { id: 'villa', label: '🏰 Villa' }, { id: 'appartement', label: '🏢 Appartement' },
                    { id: 'maison', label: '🏠 Maison' }, { id: 'duplex', label: '🏗️ Duplex' },
                    { id: 'studio', label: '🛏️ Studio' }, { id: 'chambre', label: '🚪 Chambre(s)' },
                    { id: 'immeuble', label: '🏬 Immeuble' },
                  ].map(l => (
                    <button key={l.id} type="button" className={`logement-btn ${form.typeLogement === l.id ? 'active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, typeLogement: l.id }))}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Titre <span className="req">*</span></label>
              <input required value={form.titre} onChange={set('titre')} maxLength={100} />
              <small>{form.titre.length}/100</small>
            </div>

            {form.type !== 'terrain' ? (
              <div className="form-grid-4">
                <div className="form-group"><label>Chambres</label>
                  <select value={form.nbChambres} onChange={set('nbChambres')}>
                    <option value="">—</option>
                    {[1,2,3,4,5,6,7,8,'9+'].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                {isAgence && <>
                  <div className="form-group"><label>Pièces</label>
                    <select value={form.nbPieces} onChange={set('nbPieces')}>
                      <option value="">—</option>
                      {[1,2,3,4,5,6,7,8,9,10,'10+'].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Salle de bain</label>
                    <select value={form.nbSDB} onChange={set('nbSDB')}>
                      <option value="">—</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Surface (m²)</label>
                    <input type="number" min={0} value={form.surface} onChange={set('surface')} />
                  </div>
                </>}
              </div>
            ) : (
              <div className="form-grid-3">
                <div className="form-group"><label>Superficie (m²)</label>
                  <input type="number" min={0} value={form.surfaceTerrain} onChange={set('surfaceTerrain')} />
                </div>
                <div className="form-group"><label>Titre foncier</label>
                  <select value={form.titreFoncier} onChange={set('titreFoncier')}>
                    <option value="">Non précisé</option>
                    <option value="tf">Titre Foncier (TF)</option>
                    <option value="pf">Permis Foncier (PF)</option>
                    <option value="lettre-attribution">Lettre d'attribution</option>
                    <option value="acte-vente">Acte de vente</option>
                    <option value="non-titre">Non titré</option>
                  </select>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Description <span className="req">*</span></label>
              <textarea required rows={5} value={form.description} onChange={set('description')} />
            </div>
          </div>

          {/* Équipements */}
          {isAgence && (
            <div className="lf-section">
              <div className="lf-section-title"><span className="lf-num">4</span><div><h2>Équipements & Commodités</h2></div></div>
              <div className="equip-grid">
                {EQUIPEMENTS_LIST.map(eq => (
                  <button key={eq.id} type="button" className={`equip-btn ${form.equipements.includes(eq.id) ? 'active' : ''}`} onClick={() => toggleEquipement(eq.id)}>
                    <span className="equip-icon">{eq.icon}</span>
                    <span className="equip-label">{eq.label}</span>
                    {form.equipements.includes(eq.id) && <span className="equip-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prix */}
          <div className="lf-section">
            <div className="lf-section-title"><span className="lf-num">{isAgence ? '5' : '4'}</span><div><h2>Prix & Conditions</h2></div></div>
            <div className="prix-block">
              <div className="form-group prix-input-wrap">
                <label>Prix (GNF){form.type === 'location' ? ' / mois' : ''} <span className="req">*</span></label>
                <input type="number" required min={0} step={1000} value={form.prix} onChange={set('prix')} className="prix-input" />
                {prixFormate && <span className="prix-preview">{prixFormate}</span>}
              </div>
              <div className="form-group">
                <label className="toggle-label">
                  <button type="button" className={`toggle-btn ${form.negotiable ? 'on' : ''}`} onClick={toggle('negotiable')}><span className="toggle-knob" /></button>
                  Prix négociable
                </label>
              </div>
            </div>
            {form.type === 'location' && (
              <div className="form-grid-3" style={{ marginTop: '1rem' }}>
                <div className="form-group"><label>Caution (mois)</label>
                  <select value={form.caution} onChange={set('caution')}>
                    <option value="0">Aucune</option>
                    <option value="1">1 mois</option>
                    <option value="2">2 mois</option>
                    <option value="3">3 mois</option>
                    <option value="6">6 mois</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="toggle-label" style={{ marginTop: '1.6rem' }}>
                    <button type="button" className={`toggle-btn ${form.chargesIncluses ? 'on' : ''}`} onClick={toggle('chargesIncluses')}><span className="toggle-knob" /></button>
                    Charges incluses
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="lf-section">
            <div className="lf-section-title"><span className="lf-num">{isAgence ? '6' : '5'}</span><div><h2>Contact</h2></div></div>
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

          {/* Photos */}
          <div className="lf-section">
            <div className="lf-section-title"><span className="lf-num">{isAgence ? '7' : '6'}</span><div><h2>Photos actuelles</h2><p>Sélectionnez de nouvelles photos pour remplacer les existantes</p></div></div>

            {photosExistantes.length > 0 && photos.length === 0 && (
              <div className="photo-grid" style={{ marginBottom: '1rem' }}>
                {photosExistantes.map((p, i) => (
                  <div key={i} className={`photo-thumb ${i === 0 ? 'main' : ''}`}>
                    <img src={p.url} alt="" />
                    {i === 0 && <span className="photo-main-label">Principale</span>}
                  </div>
                ))}
              </div>
            )}

            <div
              className={`photo-drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addPhotos(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={e => addPhotos(e.target.files)} style={{ display: 'none' }} />
              <span className="drop-icon">📷</span>
              <p className="drop-hint">Cliquez ou glissez pour remplacer les photos</p>
              <p className="drop-sub">Les nouvelles photos remplaceront toutes les existantes</p>
            </div>

            {previews.length > 0 && (
              <div className="photo-grid" style={{ marginTop: '1rem' }}>
                {previews.map((url, i) => (
                  <div key={i} className={`photo-thumb ${i === 0 ? 'main' : ''}`}>
                    <img src={url} alt="" />
                    {i === 0 && <span className="photo-main-label">Principale</span>}
                    <button type="button" className="photo-remove" onClick={() => removeNew(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Infos agence */}
          {isAgence && (
            <div className="lf-section lf-section-agence">
              <div className="lf-section-title"><span className="lf-num">8</span><div><h2>Informations agence</h2></div></div>
              <div className="form-grid-2">
                <div className="form-group"><label>Référence interne</label>
                  <input placeholder="Ex: AGN-2024-001" value={form.refInterne} onChange={set('refInterne')} />
                </div>
                <div className="form-group"><label>Type de mandat</label>
                  <div className="mandat-btns">
                    {[{ id: 'simple', label: '📝 Mandat simple', sub: 'Multi-agences' }, { id: 'exclusif', label: '🔒 Mandat exclusif', sub: 'Vous seul' }].map(m => (
                      <button key={m.id} type="button" className={`mandat-btn ${form.typeMandat === m.id ? 'active' : ''}`}
                        onClick={() => setForm(f => ({ ...f, typeMandat: f.typeMandat === m.id ? '' : m.id }))}>
                        <span>{m.label}</span><small>{m.sub}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="lf-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Annuler</button>
            <button type="submit" className="btn btn-primary lf-submit" disabled={sauvegarde}>
              {sauvegarde ? <><span className="spinner-sm" /> Sauvegarde...</> : '✓ Enregistrer les modifications'}
            </button>
          </div>
          <p className="lf-disclaimer">Les modifications seront vérifiées avant republication.</p>
        </form>
      </div>
    </div>
  );
}
