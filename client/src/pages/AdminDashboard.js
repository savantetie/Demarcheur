import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './AdminDashboard.css';

const PLANS_COLOR = { gratuit: '#6b7280', basic: '#2563eb', premium: '#7c3aed', elite: '#d97706' };

const LABELS_STATUT = { en_attente: 'En attente', publie: 'Publié', loue: 'Loué', vendu: 'Vendu', rejete: 'Rejeté' };
const LABELS_TYPE = { 'location': 'Location', 'vente-maison': 'Vente maison', 'terrain': 'Terrain' };

export default function AdminDashboard() {
  const [onglet, setOnglet] = useState('tableau');
  const [stats, setStats] = useState(null);
  const [enAttente, setEnAttente] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [users, setUsers] = useState([]);
  const [agences, setAgences] = useState([]);
  const [abonnements, setAbonnements] = useState([]);
  const [statsMonetisation, setStatsMonetisation] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    setChargement(true);
    try {
      const [statsRes, attenteRes, usersRes, agencesRes] = await Promise.all([
        api.get('/admin/tableau'),
        api.get('/admin/annonces/en-attente'),
        api.get('/admin/utilisateurs'),
        api.get('/admin/agences/en-attente'),
      ]);
      setStats(statsRes.data);
      setEnAttente(attenteRes.data.annonces);
      setUsers(usersRes.data.users);
      setAgences(agencesRes.data.agences);
    } finally { setChargement(false); }
  };

  const chargerMonetisation = async () => {
    try {
      const [aboRes, statsRes] = await Promise.all([
        api.get('/subscriptions/admin/all'),
        api.get('/analytics/admin'),
      ]);
      setAbonnements(aboRes.data.abonnements);
      setStatsMonetisation({ ...aboRes.data, ...statsRes.data });
    } catch { toast.error('Erreur chargement monétisation.'); }
  };

  const handleOnglet = (o) => {
    setOnglet(o);
    if (o === 'toutes') api.get('/admin/annonces').then(r => setAnnonces(r.data.annonces));
    if (o === 'monetisation') chargerMonetisation();
  };

  const handleConfirmerAbo = async (id) => {
    try {
      await api.patch(`/subscriptions/admin/${id}/confirmer`);
      toast.success('Abonnement confirmé !');
      chargerMonetisation();
    } catch { toast.error('Erreur.'); }
  };

  const handleValiderAnnonce = async (id, decision) => {
    try {
      await api.patch(`/admin/annonces/${id}/valider`, { decision });
      setEnAttente(prev => prev.filter(a => a._id !== id));
      toast.success(decision === 'publie' ? 'Annonce publiée !' : 'Annonce rejetée.');
    } catch { toast.error('Erreur.'); }
  };

  const handleValiderAgence = async (id, decision) => {
    try {
      await api.patch(`/admin/agences/${id}/valider`, { decision });
      setAgences(prev => prev.filter(a => a._id !== id));
      toast.success(decision === 'approuver' ? 'Agence approuvée !' : 'Agence refusée.');
    } catch { toast.error('Erreur.'); }
  };

  const handleToggleUser = async (id) => {
    try {
      const res = await api.patch(`/admin/utilisateurs/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u));
      toast.success('Statut mis à jour.');
    } catch { toast.error('Erreur.'); }
  };

  if (chargement) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  const abonnementsEnAttente = abonnements.filter(a => a.statut === 'en_attente').length;

  const ONGLETS = [
    { key: 'tableau', label: 'Tableau de bord' },
    { key: 'attente', label: `Annonces (${enAttente.length})` },
    { key: 'agences', label: `Agences (${agences.length})`, rouge: agences.length > 0 },
    { key: 'toutes', label: 'Toutes les annonces' },
    { key: 'users', label: 'Utilisateurs' },
    { key: 'monetisation', label: '💰 Monétisation', rouge: abonnementsEnAttente > 0, count: abonnementsEnAttente },
  ];

  return (
    <div className="page container">
      <h1 className="page-titre">⚙️ Administration</h1>

      <div className="onglets">
        {ONGLETS.map(o => (
          <button key={o.key} className={`onglet ${onglet === o.key ? 'actif' : ''}`} onClick={() => handleOnglet(o.key)}>
            {o.label}
            {o.rouge && o.count > 0 && <span className="badge-count rouge">{o.count}</span>}
            {o.rouge && !o.count && agences.length > 0 && o.key === 'agences' && <span className="badge-count rouge">{agences.length}</span>}
          </button>
        ))}
      </div>

      {/* Tableau de bord */}
      {onglet === 'tableau' && stats && (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><span className="stat-num">{stats.totalAnnonces}</span><span>Total annonces</span></div>
            <div className="stat-card orange"><span className="stat-num">{stats.enAttente}</span><span>En attente</span></div>
            <div className="stat-card vert"><span className="stat-num">{stats.publiees}</span><span>Publiées</span></div>
            <div className="stat-card bleu"><span className="stat-num">{stats.louees}</span><span>Louées</span></div>
            <div className="stat-card violet"><span className="stat-num">{stats.vendues}</span><span>Vendues</span></div>
            <div className="stat-card"><span className="stat-num">{stats.totalUsers}</span><span>Utilisateurs</span></div>
            <div className="stat-card vert"><span className="stat-num">{stats.totalAgences}</span><span>Agences</span></div>
            <div className="stat-card orange"><span className="stat-num">{stats.agencesEnAttente}</span><span>Agences en attente</span></div>
          </div>
          <div className="types-chart">
            <h3>Répartition par type</h3>
            {stats.parType.map(t => (
              <div key={t._id} className="type-bar">
                <span>{LABELS_TYPE[t._id] || t._id}</span>
                <div className="bar"><div className="bar-fill" style={{ width: `${stats.totalAnnonces ? (t.count / stats.totalAnnonces) * 100 : 0}%` }} /></div>
                <span className="bar-count">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Annonces en attente */}
      {onglet === 'attente' && (
        enAttente.length === 0 ? (
          <div className="vide-dashboard"><p>Aucune annonce en attente.</p></div>
        ) : (
          <div className="annonces-validation">
            {enAttente.map(a => (
              <div key={a._id} className="validation-card">
                {a.photos[0] && <img src={a.photos[0].url} alt={a.titre} className="validation-img" />}
                <div className="validation-info">
                  <h3>{a.titre}</h3>
                  <p>📍 {a.quartier}, {a.ville} · {LABELS_TYPE[a.type]}</p>
                  <p>👤 {a.proprietaire?.nom} ({a.proprietaire?.role === 'agency' ? '🏢 Agence' : '👤 Particulier'})</p>
                  <p className="validation-desc">{a.description}</p>
                </div>
                <div className="validation-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleValiderAnnonce(a._id, 'publie')}>✓ Publier</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleValiderAnnonce(a._id, 'rejete')}>✗ Rejeter</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Validation agences */}
      {onglet === 'agences' && (
        agences.length === 0 ? (
          <div className="vide-dashboard"><p>Aucune agence en attente de validation.</p></div>
        ) : (
          <div className="annonces-validation">
            {agences.map(a => (
              <div key={a._id} className="validation-card agence-card">
                <div className="agence-icon">🏢</div>
                <div className="validation-info">
                  <h3>{a.agence?.nomEntreprise}</h3>
                  <p>👤 Responsable : <strong>{a.nom}</strong></p>
                  <p>📧 {a.email} · 📞 {a.telephone}</p>
                  {a.agence?.ville && <p>🌍 Ville : {a.agence.ville || a.ville}</p>}
                  {a.agence?.numeroEnregistrement && <p>📋 N° RCCM : <strong>{a.agence.numeroEnregistrement}</strong></p>}
                  {a.agence?.adresse && <p>📍 {a.agence.adresse}</p>}
                  {a.agence?.siteWeb && <p>🌐 <a href={a.agence.siteWeb} target="_blank" rel="noopener noreferrer">{a.agence.siteWeb}</a></p>}
                  {a.agence?.description && <p className="validation-desc">💬 {a.agence.description}</p>}
                  {a.agence?.documentRCCM
                    ? <a href={a.agence.documentRCCM} target="_blank" rel="noopener noreferrer" className="btn-doc-rccm">📄 Voir le document RCCM</a>
                    : <p style={{ fontSize: '.78rem', color: '#f59e0b' }}>⚠️ Aucun document RCCM joint</p>
                  }
                  <p style={{ fontSize: '.75rem', color: 'var(--gris)', marginTop: '.5rem' }}>
                    Demande reçue le {new Date(a.agence?.dateDemande).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="validation-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleValiderAgence(a._id, 'approuver')}>✓ Approuver</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleValiderAgence(a._id, 'rejeter')}>✗ Refuser</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Toutes annonces */}
      {onglet === 'toutes' && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Titre</th><th>Type</th><th>Ville</th><th>Propriétaire</th><th>Rôle</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              {annonces.map(a => (
                <tr key={a._id}>
                  <td>{a.titre}</td>
                  <td>{LABELS_TYPE[a.type]}</td>
                  <td>{a.ville}</td>
                  <td>{a.proprietaire?.nom}</td>
                  <td><span style={{ fontSize: '.75rem' }}>{a.proprietaire?.role === 'agency' ? '🏢' : '👤'}</span></td>
                  <td><span className={`badge badge-${a.statut}`}>{LABELS_STATUT[a.statut]}</span></td>
                  <td>{new Date(a.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Utilisateurs */}
      {onglet === 'users' && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Entreprise</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.nom}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'agency' ? 'badge-publie' : u.role === 'admin' ? 'badge-loue' : 'badge-en_attente'}`}>
                      {u.role === 'agency' ? '🏢 Agence' : u.role === 'admin' ? '⚙️ Admin' : '👤 User'}
                    </span>
                  </td>
                  <td>{u.agence?.nomEntreprise || '-'}</td>
                  <td><span className={`badge ${u.actif ? 'badge-publie' : 'badge-rejete'}`}>{u.actif ? 'Actif' : 'Inactif'}</span></td>
                  <td>
                    {u.role !== 'admin' && (
                      <button className={`btn btn-sm ${u.actif ? 'btn-danger' : 'btn-primary'}`} onClick={() => handleToggleUser(u._id)}>
                        {u.actif ? 'Suspendre' : 'Réactiver'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Monétisation */}
      {onglet === 'monetisation' && (
        <div>
          {statsMonetisation && (
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card vert">
                <span className="stat-num">{new Intl.NumberFormat('fr-GN').format(statsMonetisation.revenus || 0)}</span>
                <span>Revenus totaux (GNF)</span>
              </div>
              <div className="stat-card bleu">
                <span className="stat-num">{statsMonetisation.subsActives || 0}</span>
                <span>Abonnements actifs</span>
              </div>
              <div className="stat-card violet">
                <span className="stat-num">{new Intl.NumberFormat('fr-GN').format(statsMonetisation.revenusMois || 0)}</span>
                <span>Revenus ce mois (GNF)</span>
              </div>
              {(statsMonetisation.parPlan || []).map(p => (
                <div key={p._id} className="stat-card">
                  <span className="stat-num" style={{ color: PLANS_COLOR[p._id] }}>{p.count}</span>
                  <span>{p._id?.charAt(0).toUpperCase() + p._id?.slice(1)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Paiements en attente — priorité */}
          {abonnements.filter(a => a.statut === 'en_attente').length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: 800, marginBottom: '1rem', color: '#b45309' }}>
                ⏳ Paiements à valider ({abonnements.filter(a => a.statut === 'en_attente').length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                {abonnements.filter(a => a.statut === 'en_attente').map(a => (
                  <div key={a._id} className="paiement-attente-card">
                    <div className="pac-left">
                      <span style={{ background: PLANS_COLOR[a.plan], color: '#fff', padding: '.2rem .7rem', borderRadius: '999px', fontSize: '.78rem', fontWeight: 800 }}>
                        {a.plan?.toUpperCase()}
                      </span>
                      <div className="pac-agence">
                        <strong>{a.agence?.agence?.nomEntreprise || a.agence?.nom}</strong>
                        <span>{a.agence?.email}</span>
                      </div>
                    </div>
                    <div className="pac-info">
                      <div className="pac-row">
                        <span>Montant</span>
                        <strong>{a.paiement?.montant ? new Intl.NumberFormat('fr-GN').format(a.paiement.montant) + ' GNF' : '-'}</strong>
                      </div>
                      <div className="pac-row">
                        <span>Méthode</span>
                        <strong>{{ orange_money: '🟠 Orange Money', mtn_money: '🟡 MTN Money', especes: '💵 Espèces' }[a.paiement?.methode] || a.paiement?.methode}</strong>
                      </div>
                      {a.paiement?.numeroExpediteur && (
                        <div className="pac-row">
                          <span>N° expéditeur</span>
                          <strong>{a.paiement.numeroExpediteur}</strong>
                        </div>
                      )}
                      {a.paiement?.noteClient && (
                        <div className="pac-row">
                          <span>Référence client</span>
                          <strong>{a.paiement.noteClient}</strong>
                        </div>
                      )}
                      <div className="pac-row">
                        <span>Référence</span>
                        <code style={{ fontSize: '.8rem' }}>{a.paiement?.reference}</code>
                      </div>
                      <div className="pac-row">
                        <span>Soumis le</span>
                        <span>{new Date(a.createdAt).toLocaleDateString('fr-FR')} à {new Date(a.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="pac-actions">
                      <button className="btn btn-primary" onClick={() => handleConfirmerAbo(a._id)}>
                        ✓ Confirmer le paiement
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Tous les abonnements</h3>
          {abonnements.length === 0 ? (
            <div className="vide-dashboard"><p>Aucun abonnement.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Agence</th><th>Plan</th><th>Montant</th><th>Méthode</th><th>N° expéditeur</th><th>Statut</th><th>Expiration</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {abonnements.map(a => (
                    <tr key={a._id}>
                      <td>{a.agence?.nom || '-'}<br /><small style={{ color: 'var(--gris)' }}>{a.agence?.agence?.nomEntreprise}</small></td>
                      <td>
                        <span style={{ background: PLANS_COLOR[a.plan], color: '#fff', padding: '.15rem .6rem', borderRadius: '999px', fontSize: '.75rem', fontWeight: 700 }}>
                          {a.plan?.toUpperCase()}
                        </span>
                      </td>
                      <td>{a.paiement?.montant ? new Intl.NumberFormat('fr-GN').format(a.paiement.montant) + ' GNF' : '-'}</td>
                      <td>{a.paiement?.methode || '-'}</td>
                      <td>{a.paiement?.numeroExpediteur || '-'}</td>
                      <td>
                        <span className={`badge badge-${a.statut === 'actif' ? 'publie' : a.statut === 'en_attente' ? 'en_attente' : 'rejete'}`}>
                          {a.statut}
                        </span>
                      </td>
                      <td>{a.dateFin ? new Date(a.dateFin).toLocaleDateString('fr-FR') : '-'}</td>
                      <td>
                        {a.statut === 'en_attente' && (
                          <button className="btn btn-sm btn-primary" onClick={() => handleConfirmerAbo(a._id)}>
                            ✓ Confirmer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
