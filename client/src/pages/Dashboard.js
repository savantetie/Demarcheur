import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import AvatarUpload from '../components/AvatarUpload';
import './Dashboard.css';

const PLANS_LABEL = { gratuit: 'Gratuit', basic: 'Basic', premium: 'Premium', elite: 'Elite' };
const PLANS_COLOR = { gratuit: '#6b7280', basic: '#2563eb', premium: '#7c3aed', elite: '#d97706' };
const BOOST_LABELS = { top: '🔝 Top liste', premium: '⭐ Premium', sponsorise: '📢 Sponsorisé' };

function AgenceEnAttente({ user }) {
  const { rafraichirUser } = useAuth();
  const [fichier, setFichier] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(!!user.agence?.documentRCCM);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fichier) return toast.error('Sélectionnez un document.');
    setEnvoi(true);
    try {
      const data = new FormData();
      data.append('document', fichier);
      await api.post('/auth/agence/document', data);
      await rafraichirUser();
      setEnvoye(true);
      toast.success('Document envoyé avec succès !');
    } catch {
      toast.error("Erreur lors de l'envoi.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="page container">
      <div className="agence-pending-page">
        <AvatarUpload size={80} />
        <div className="pending-icon" style={{ marginTop: '1rem' }}>⏳</div>
        <h1>Validation en cours</h1>
        <p>Votre compte agence <strong>{user.agence?.nomEntreprise}</strong> est en cours d'examen par notre équipe.</p>
        <p>Vous recevrez une notification par email sous <strong>24-48h</strong>.</p>

        <div className="pending-steps">
          <div className="pending-step done">
            <div className="pstep-icon">✓</div>
            <div><strong>Inscription soumise</strong><span>Le {new Date(user.agence?.dateDemande).toLocaleDateString('fr-FR')}</span></div>
          </div>
          <div className={`pending-step ${envoye ? 'done' : 'active'}`}>
            <div className="pstep-icon">{envoye ? '✓' : '2'}</div>
            <div><strong>Document RCCM</strong><span>{envoye ? 'Document reçu' : 'En attente de votre document'}</span></div>
          </div>
          <div className="pending-step">
            <div className="pstep-icon">3</div>
            <div><strong>Examen du dossier</strong><span>Notre équipe vérifie votre dossier</span></div>
          </div>
          <div className="pending-step">
            <div className="pstep-icon">4</div>
            <div><strong>Activation du compte</strong><span>Accès complet à la plateforme</span></div>
          </div>
        </div>

        {!envoye && (
          <div className="pending-upload-card">
            <h3>📄 Envoyez votre document RCCM</h3>
            <p>Pour accélérer la validation, joignez votre registre de commerce (RCCM) ou tout document officiel d'enregistrement de votre entreprise.</p>
            <form onSubmit={handleUpload} className="pending-upload-form">
              <label className="file-label">
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFichier(e.target.files[0])} />
                <span>{fichier ? `✓ ${fichier.name}` : '📎 Sélectionner un fichier (PDF, JPG, PNG — max 10 Mo)'}</span>
              </label>
              <button type="submit" className="btn btn-primary" disabled={envoi || !fichier}>
                {envoi ? 'Envoi...' : 'Envoyer le document'}
              </button>
            </form>
          </div>
        )}

        {envoye && (
          <div className="pending-upload-card done-card">
            <p>✅ <strong>Document RCCM reçu.</strong> Notre équipe va examiner votre dossier.</p>
          </div>
        )}

        <div className="pending-info">
          <p>Des questions ? Contactez-nous à <strong>support@demarcheur.gn</strong></p>
        </div>
      </div>
    </div>
  );
}

const formaterPrix = (p) => new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(p) + ' GNF';
const LABELS_TYPE = { 'location': 'Location', 'vente-maison': 'Vente maison', 'terrain': 'Terrain' };
const LABELS_STATUT = { en_attente: 'En attente', publie: 'Publié', loue: 'Loué', vendu: 'Vendu', rejete: 'Rejeté' };

export default function Dashboard() {
  const { user } = useAuth();
  const [onglet, setOnglet] = useState('annonces');
  const [annonces, setAnnonces] = useState([]);
  const [messages, setMessages] = useState([]);
  const [favoris, setFavoris] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [nouvelleAlerte, setNouvelleAlerte] = useState({ nom: '', criteres: { type: '', ville: '', prixMax: '' } });
  const [abonnement, setAbonnement] = useState(null);
  const [statsAgence, setStatsAgence] = useState(null);
  const [historiqueAbo, setHistoriqueAbo] = useState([]);
  const [boostModal, setBoostModal] = useState(null); // { annonceId, titre }
  const [boostType, setBoostType] = useState('top');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const reqs = [
      api.get('/listings/mes-annonces'),
      api.get('/messages/recus'),
      api.get('/auth/favoris'),
      api.get('/auth/alertes'),
    ];
    Promise.all(reqs).then(([ann, msg, fav, ale]) => {
      setAnnonces(ann.data.annonces);
      setMessages(msg.data.messages);
      setFavoris(fav.data.favoris);
      setAlertes(ale.data.alertes);
    }).finally(() => setChargement(false));

    if (user?.role === 'agency') {
      api.get('/subscriptions/mon-abonnement').then(r => setAbonnement(r.data.abonnement)).catch(() => {});
      api.get('/analytics/agence').then(r => setStatsAgence(r.data)).catch(() => {});
      api.get('/subscriptions/historique').then(r => setHistoriqueAbo(r.data.historique || [])).catch(() => {});
    }
  }, [user]);

  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer cette annonce définitivement ?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setAnnonces(prev => prev.filter(a => a._id !== id));
      toast.success('Annonce supprimée.');
    } catch { toast.error('Erreur.'); }
  };

  const handleStatut = async (id, statut) => {
    try {
      const res = await api.patch(`/listings/${id}/statut`, { statut });
      setAnnonces(prev => prev.map(a => a._id === id ? res.data.annonce : a));
      toast.success('Statut mis à jour.');
    } catch { toast.error('Erreur.'); }
  };

  const handleMarquerLu = async (msgId) => {
    await api.patch(`/messages/${msgId}/lu`);
    setMessages(prev => prev.map(m => m._id === msgId ? { ...m, lu: true } : m));
  };

  const handleToggleFavori = async (listingId) => {
    try {
      await api.post(`/auth/favoris/${listingId}`);
      setFavoris(prev => prev.filter(f => f._id !== listingId));
    } catch { toast.error('Erreur.'); }
  };

  const handleCreerAlerte = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/alertes', nouvelleAlerte);
      setAlertes(prev => [res.data.alerte, ...prev]);
      setNouvelleAlerte({ nom: '', criteres: { type: '', ville: '', prixMax: '' } });
      toast.success('Alerte créée !');
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.'); }
  };

  const handleSupprimerAlerte = async (id) => {
    await api.delete(`/auth/alertes/${id}`);
    setAlertes(prev => prev.filter(a => a._id !== id));
    toast.success('Alerte supprimée.');
  };

  const handleToggleAlerte = async (id) => {
    const res = await api.patch(`/auth/alertes/${id}/toggle`);
    setAlertes(prev => prev.map(a => a._id === id ? res.data.alerte : a));
  };

  const handleBooster = async () => {
    if (!boostModal) return;
    try {
      await api.post(`/featured/${boostModal.annonceId}/booster`, { type: boostType });
      toast.success(`Annonce boostée en mode ${BOOST_LABELS[boostType]} !`);
      const res = await api.get('/listings/mes-annonces');
      setAnnonces(res.data.annonces);
      setBoostModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du boost.');
    }
  };

  const handleRetirerBoost = async (id) => {
    try {
      await api.delete(`/featured/${id}/booster`);
      toast.success('Boost retiré.');
      const res = await api.get('/listings/mes-annonces');
      setAnnonces(res.data.annonces);
    } catch { toast.error('Erreur.'); }
  };

  if (chargement) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  // Agence en attente : afficher écran dédié
  if (user.role === 'agency' && !user.agence?.valide) {
    return <AgenceEnAttente user={user} />;
  }

  const nonLus = messages.filter(m => !m.lu).length;
  const peutPublier = user.role === 'admin' || user.role === 'agency' ? true : annonces.length < 3;

  const ONGLETS = [
    { key: 'annonces', label: 'Mes annonces', count: annonces.length },
    { key: 'messages', label: 'Messages', count: nonLus, rouge: true },
    { key: 'favoris', label: 'Favoris', count: favoris.length },
    { key: 'alertes', label: 'Alertes', count: alertes.length },
    ...(user.role === 'agency' ? [
      { key: 'abonnement', label: 'Abonnement' },
      { key: 'analytics', label: 'Statistiques' },
    ] : []),
  ];

  return (
    <div className="page container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-user">
          <AvatarUpload size={56} />
          <div>
            <h1>Bonjour, {user.nom}</h1>
            <div className="dashboard-meta">
              <span className={`role-badge role-${user.role}`}>
                {user.role === 'agency' ? '🏢 Agence' : user.role === 'admin' ? '⚙️ Admin' : '👤 Particulier'}
              </span>
              {user.role === 'agency' && !user.agence?.valide && (
                <span className="badge badge-en_attente">En attente de validation</span>
              )}
              {user.role === 'agency' && user.agence?.valide && (
                <span className="badge badge-publie">✓ Agence vérifiée</span>
              )}
            </div>
          </div>
        </div>

        {peutPublier ? (
          <Link to="/nouvelle-annonce" className="btn btn-or">+ Publier une annonce</Link>
        ) : (
          <div className="limite-atteinte">
            <p>Limite de 3 annonces atteinte</p>
            <Link to="/inscription/agence" className="btn btn-primary btn-sm">Passer Pro →</Link>
          </div>
        )}
      </div>

      {/* Alerte agence en attente */}
      {user.role === 'agency' && !user.agence?.valide && (
        <div className="agency-pending-banner">
          ⏳ <strong>Votre compte agence est en cours de validation.</strong> Notre équipe examine votre dossier sous 24-48h. Vous pourrez publier dès validation.
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="dashboard-stats">
        <div className="dash-stat"><span className="dash-stat-n">{annonces.length}</span><span>Annonces</span></div>
        <div className="dash-stat"><span className="dash-stat-n">{annonces.filter(a => a.statut === 'publie').length}</span><span>Publiées</span></div>
        <div className="dash-stat"><span className="dash-stat-n">{messages.length}</span><span>Messages</span></div>
        <div className="dash-stat"><span className="dash-stat-n">{favoris.length}</span><span>Favoris</span></div>
      </div>

      {/* Onglets */}
      <div className="onglets">
        {ONGLETS.map(o => (
          <button key={o.key} className={`onglet ${onglet === o.key ? 'actif' : ''}`} onClick={() => setOnglet(o.key)}>
            {o.label}
            {o.count > 0 && <span className={`badge-count ${o.rouge ? 'rouge' : ''}`}>{o.count}</span>}
          </button>
        ))}
      </div>

      {/* ===== ANNONCES ===== */}
      {onglet === 'annonces' && (
        annonces.length === 0 ? (
          <div className="vide-dashboard">
            <p>Vous n'avez pas encore d'annonces.</p>
            {peutPublier && <Link to="/nouvelle-annonce" className="btn btn-primary" style={{ marginTop: '1rem' }}>Créer ma première annonce</Link>}
          </div>
        ) : (
          <div className="annonces-liste">
            {annonces.map(a => (
              <div key={a._id} className="annonce-row">
                <div className="annonce-row-img">
                  {a.photos[0] ? <img src={a.photos[0].url} alt={a.titre} /> : <div className="img-placeholder">🏠</div>}
                </div>
                <div className="annonce-row-info">
                  <h3>{a.titre}</h3>
                  <p>📍 {a.quartier}, {a.ville} · {LABELS_TYPE[a.type]} · {formaterPrix(a.prix)}</p>
                  <span className={`badge badge-${a.statut}`}>{LABELS_STATUT[a.statut]}</span>
                </div>
                <div className="annonce-row-actions">
                  {a.statut === 'publie' && (
                    <>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleStatut(a._id, 'loue')}>Marquer loué</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleStatut(a._id, 'vendu')}>Marquer vendu</button>
                    </>
                  )}
                  {a.statut === 'publie' && user.role === 'agency' && (
                    a.featured && a.featuredExpiry && new Date(a.featuredExpiry) >= new Date() ? (
                      <button className="btn btn-sm btn-boost active" onClick={() => handleRetirerBoost(a._id)}>
                        {BOOST_LABELS[a.featuredType] || '⭐ Boosté'} ✕
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-boost" onClick={() => setBoostModal({ annonceId: a._id, titre: a.titre })}>
                        ⚡ Booster
                      </button>
                    )
                  )}
                  <Link to={`/modifier-annonce/${a._id}`} className="btn btn-sm btn-outline">Modifier</Link>
                  <button className="btn btn-sm btn-danger" onClick={() => handleSupprimer(a._id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ===== MESSAGES ===== */}
      {onglet === 'messages' && (
        messages.length === 0 ? (
          <div className="vide-dashboard"><p>Aucun message reçu.</p></div>
        ) : (
          <div className="messages-liste">
            {messages.map(m => (
              <div key={m._id} className={`message-card ${!m.lu ? 'non-lu' : ''}`}>
                <div className="message-header">
                  <strong>{m.nomExpediteur}</strong>
                  <span className="message-annonce">re: {m.annonce?.titre}</span>
                  {!m.lu && <button className="btn btn-sm btn-secondary" onClick={() => handleMarquerLu(m._id)}>Marquer lu</button>}
                </div>
                <p className="message-contenu">{m.contenu}</p>
                <div className="message-footer">
                  <span>📧 {m.emailExpediteur}</span>
                  {m.telephoneExpediteur && <span>📞 {m.telephoneExpediteur}</span>}
                  <span className="message-date">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ===== FAVORIS ===== */}
      {onglet === 'favoris' && (
        favoris.length === 0 ? (
          <div className="vide-dashboard">
            <p>Aucun bien sauvegardé.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Explorer les annonces</Link>
          </div>
        ) : (
          <div>
            <div className="grille-annonces">
              {favoris.map(f => (
                <div key={f._id} style={{ position: 'relative' }}>
                  <ListingCard annonce={f} />
                  <button className="favori-remove" onClick={() => handleToggleFavori(f._id)} title="Retirer des favoris">✕</button>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* ===== ABONNEMENT ===== */}
      {onglet === 'abonnement' && (
        <div className="abonnement-section">
          {abonnement ? (
            <div className="abo-actif-card">
              <div className="abo-actif-header">
                <span className="abo-plan-badge" style={{ background: PLANS_COLOR[abonnement.plan] }}>
                  {PLANS_LABEL[abonnement.plan]}
                </span>
                <span className="abo-statut badge badge-publie">Actif</span>
              </div>
              <div className="abo-dates">
                <span>Début : <strong>{new Date(abonnement.dateDebut).toLocaleDateString('fr-FR')}</strong></span>
                <span>Expiration : <strong>{new Date(abonnement.dateFin).toLocaleDateString('fr-FR')}</strong></span>
              </div>
              <p style={{ marginTop: '.5rem', fontSize: '.85rem', color: 'var(--gris)' }}>
                Référence paiement : {abonnement.paiement?.reference}
              </p>
            </div>
          ) : (
            <div className="abo-vide">
              <p>Vous êtes sur le <strong>plan Gratuit</strong> (3 annonces max).</p>
              <Link to="/tarifs" className="btn btn-primary" style={{ marginTop: '1rem' }}>Voir les plans →</Link>
            </div>
          )}

          {historiqueAbo.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Historique</h3>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Plan</th><th>Méthode</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead>
                  <tbody>
                    {historiqueAbo.map(h => (
                      <tr key={h._id}>
                        <td><span className="abo-plan-badge" style={{ background: PLANS_COLOR[h.plan], color: '#fff', padding: '.15rem .6rem', borderRadius: '999px', fontSize: '.75rem' }}>{PLANS_LABEL[h.plan]}</span></td>
                        <td>{h.paiement?.methode || '-'}</td>
                        <td>{h.paiement?.montant ? new Intl.NumberFormat('fr-GN').format(h.paiement.montant) + ' GNF' : '-'}</td>
                        <td><span className={`badge badge-${h.statut === 'actif' ? 'publie' : h.statut === 'en_attente' ? 'en_attente' : 'rejete'}`}>{h.statut}</span></td>
                        <td>{new Date(h.createdAt).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/tarifs" className="btn btn-outline">Gérer mon abonnement</Link>
          </div>
        </div>
      )}

      {/* ===== ANALYTICS ===== */}
      {onglet === 'analytics' && (
        <div className="analytics-section">
          {statsAgence ? (
            <>
              <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="dash-stat"><span className="dash-stat-n">{statsAgence.totalVues}</span><span>Vues totales</span></div>
                <div className="dash-stat"><span className="dash-stat-n">{statsAgence.totalContacts}</span><span>Contacts reçus</span></div>
                <div className="dash-stat"><span className="dash-stat-n">{statsAgence.annoncesBoostees}</span><span>Annonces boostées</span></div>
              </div>

              {statsAgence.topAnnonces.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Top annonces par vues</h3>
                  <div className="table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Annonce</th><th>Vues</th><th>Contacts</th><th>Statut</th></tr></thead>
                      <tbody>
                        {statsAgence.topAnnonces.map(a => (
                          <tr key={a._id}>
                            <td>{a.titre}</td>
                            <td><strong>{a.vues || 0}</strong></td>
                            <td>{a.contactsRecus || 0}</td>
                            <td><span className={`badge badge-${a.statut}`}>{a.statut}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Répartition par type</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {Object.entries(statsAgence.parType || {}).map(([type, count]) => (
                    <div key={type} className="dash-stat" style={{ flex: '1', minWidth: '120px' }}>
                      <span className="dash-stat-n">{count}</span>
                      <span>{{ location: 'Location', 'vente-maison': 'Vente', terrain: 'Terrain' }[type] || type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="vide-dashboard"><p>Chargement des statistiques...</p></div>
          )}
        </div>
      )}

      {/* ===== ALERTES ===== */}
      {onglet === 'alertes' && (
        <div>
          {/* Formulaire nouvelle alerte */}
          <div className="alerte-form-card">
            <h3>Créer une alerte</h3>
            <p>Recevez une notification quand une annonce correspond à vos critères.</p>
            <form onSubmit={handleCreerAlerte} className="alerte-form">
              <div className="form-group">
                <label>Nom de l'alerte</label>
                <input required placeholder="Ex: Maison Conakry < 5M GNF"
                  value={nouvelleAlerte.nom}
                  onChange={e => setNouvelleAlerte(p => ({ ...p, nom: e.target.value }))} />
              </div>
              <div className="alerte-criteres">
                <select value={nouvelleAlerte.criteres.type}
                  onChange={e => setNouvelleAlerte(p => ({ ...p, criteres: { ...p.criteres, type: e.target.value } }))}>
                  <option value="">Tous types</option>
                  <option value="location">Location</option>
                  <option value="vente-maison">Vente maison</option>
                  <option value="terrain">Terrain</option>
                </select>
                <input placeholder="Ville" value={nouvelleAlerte.criteres.ville}
                  onChange={e => setNouvelleAlerte(p => ({ ...p, criteres: { ...p.criteres, ville: e.target.value } }))} />
                <input type="number" placeholder="Prix max (GNF)" value={nouvelleAlerte.criteres.prixMax}
                  onChange={e => setNouvelleAlerte(p => ({ ...p, criteres: { ...p.criteres, prixMax: e.target.value } }))} />
                <button type="submit" className="btn btn-primary btn-sm">+ Créer</button>
              </div>
            </form>
          </div>

          {alertes.length === 0 ? (
            <div className="vide-dashboard"><p>Aucune alerte configurée.</p></div>
          ) : (
            <div className="alertes-liste">
              {alertes.map(a => (
                <div key={a._id} className={`alerte-card ${!a.active ? 'inactive' : ''}`}>
                  <div className="alerte-info">
                    <strong>{a.nom}</strong>
                    <div className="alerte-criteres-tags">
                      {a.criteres.type && <span className="critere-tag">{LABELS_TYPE[a.criteres.type]}</span>}
                      {a.criteres.ville && <span className="critere-tag">📍 {a.criteres.ville}</span>}
                      {a.criteres.prixMax && <span className="critere-tag">Max {formaterPrix(a.criteres.prixMax)}</span>}
                    </div>
                  </div>
                  <div className="alerte-actions">
                    <button className={`btn btn-sm ${a.active ? 'btn-secondary' : 'btn-primary'}`} onClick={() => handleToggleAlerte(a._id)}>
                      {a.active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleSupprimerAlerte(a._id)}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Boost */}
      {boostModal && (
        <div className="modal-overlay" onClick={() => setBoostModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>⚡ Booster l'annonce</h3>
            <p style={{ fontSize: '.88rem', color: 'var(--gris)', marginBottom: '1rem' }}>{boostModal.titre}</p>
            <div className="boost-options">
              {[
                { id: 'top', label: '🔝 Top liste', desc: '7 jours en tête des résultats' },
                { id: 'premium', label: '⭐ Premium', desc: '14 jours avec badge premium' },
                { id: 'sponsorise', label: '📢 Sponsorisé', desc: '30 jours avec mise en avant maximale' },
              ].map(b => (
                <button key={b.id} className={`boost-option ${boostType === b.id ? 'active' : ''}`} onClick={() => setBoostType(b.id)}>
                  <span className="boost-label">{b.label}</span>
                  <span className="boost-desc">{b.desc}</span>
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setBoostModal(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleBooster}>Activer le boost</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
