import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './AdminDashboard.css';

const LABELS_STATUT = { en_attente: 'En attente', publie: 'Publié', loue: 'Loué', vendu: 'Vendu', rejete: 'Rejeté' };
const LABELS_TYPE = { 'location': 'Location', 'vente-maison': 'Vente maison', 'terrain': 'Terrain' };

export default function AdminDashboard() {
  const [onglet, setOnglet] = useState('tableau');
  const [stats, setStats] = useState(null);
  const [enAttente, setEnAttente] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [users, setUsers] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setChargement(true);
    try {
      const [statsRes, attenteRes, usersRes] = await Promise.all([
        api.get('/admin/tableau'),
        api.get('/admin/annonces/en-attente'),
        api.get('/admin/utilisateurs'),
      ]);
      setStats(statsRes.data);
      setEnAttente(attenteRes.data.annonces);
      setUsers(usersRes.data.users);
    } finally {
      setChargement(false);
    }
  };

  const chargerAnnonces = async () => {
    const res = await api.get('/admin/annonces');
    setAnnonces(res.data.annonces);
  };

  const handleOnglet = (o) => {
    setOnglet(o);
    if (o === 'toutes') chargerAnnonces();
  };

  const handleValider = async (id, decision) => {
    try {
      await api.patch(`/admin/annonces/${id}/valider`, { decision });
      setEnAttente(prev => prev.filter(a => a._id !== id));
      if (stats) setStats(prev => ({ ...prev, enAttente: prev.enAttente - 1, publiees: decision === 'publie' ? prev.publiees + 1 : prev.publiees }));
      toast.success(decision === 'publie' ? 'Annonce publiée !' : 'Annonce rejetée.');
    } catch {
      toast.error('Erreur.');
    }
  };

  const handleToggleUser = async (id) => {
    try {
      const res = await api.patch(`/admin/utilisateurs/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u));
      toast.success('Statut utilisateur mis à jour.');
    } catch {
      toast.error('Erreur.');
    }
  };

  if (chargement) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="page container">
      <h1 className="page-titre">Administration</h1>

      <div className="onglets">
        {[['tableau', 'Tableau de bord'], ['attente', `En attente (${enAttente.length})`], ['toutes', 'Toutes les annonces'], ['users', 'Utilisateurs']].map(([k, l]) => (
          <button key={k} className={`onglet ${onglet === k ? 'actif' : ''}`} onClick={() => handleOnglet(k)}>{l}</button>
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
          </div>
          <div className="types-chart">
            <h3>Répartition par type</h3>
            {stats.parType.map(t => (
              <div key={t._id} className="type-bar">
                <span>{LABELS_TYPE[t._id] || t._id}</span>
                <div className="bar"><div className="bar-fill" style={{ width: `${(t.count / stats.totalAnnonces) * 100}%` }}></div></div>
                <span className="bar-count">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* En attente */}
      {onglet === 'attente' && (
        enAttente.length === 0 ? (
          <div className="vide-dashboard"><p>Aucune annonce en attente de validation.</p></div>
        ) : (
          <div className="annonces-validation">
            {enAttente.map(a => (
              <div key={a._id} className="validation-card">
                {a.photos[0] && <img src={a.photos[0].url} alt={a.titre} className="validation-img" />}
                <div className="validation-info">
                  <h3>{a.titre}</h3>
                  <p>📍 {a.quartier}, {a.ville} · {LABELS_TYPE[a.type]}</p>
                  <p>👤 {a.proprietaire?.nom} · {a.proprietaire?.email}</p>
                  <p className="validation-desc">{a.description}</p>
                </div>
                <div className="validation-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleValider(a._id, 'publie')}>✓ Publier</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleValider(a._id, 'rejete')}>✗ Rejeter</button>
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
            <thead>
              <tr>
                <th>Titre</th><th>Type</th><th>Ville</th><th>Propriétaire</th><th>Statut</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {annonces.map(a => (
                <tr key={a._id}>
                  <td>{a.titre}</td>
                  <td>{LABELS_TYPE[a.type]}</td>
                  <td>{a.ville}</td>
                  <td>{a.proprietaire?.nom}</td>
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
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Rôle</th><th>Statut</th><th>Action</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.nom}</td>
                  <td>{u.email}</td>
                  <td>{u.telephone}</td>
                  <td>{u.role}</td>
                  <td><span className={`badge ${u.actif ? 'badge-publie' : 'badge-rejete'}`}>{u.actif ? 'Actif' : 'Inactif'}</span></td>
                  <td>
                    {u.role !== 'admin' && (
                      <button className={`btn btn-sm ${u.actif ? 'btn-danger' : 'btn-primary'}`} onClick={() => handleToggleUser(u._id)}>
                        {u.actif ? 'Désactiver' : 'Activer'}
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
  );
}
