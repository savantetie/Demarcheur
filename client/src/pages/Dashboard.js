import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const formaterPrix = (p) =>
  new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(p);

const LABELS_TYPE = { 'location': 'Location', 'vente-maison': 'Vente maison', 'terrain': 'Terrain' };
const LABELS_STATUT = { en_attente: 'En attente', publie: 'Publié', loue: 'Loué', vendu: 'Vendu', rejete: 'Rejeté' };

export default function Dashboard() {
  const { user } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onglet, setOnglet] = useState('annonces');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/listings/mes-annonces'),
      api.get('/messages/recus'),
    ]).then(([annRes, msgRes]) => {
      setAnnonces(annRes.data.annonces);
      setMessages(msgRes.data.messages);
    }).finally(() => setChargement(false));
  }, []);

  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setAnnonces(prev => prev.filter(a => a._id !== id));
      toast.success('Annonce supprimée.');
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleStatut = async (id, statut) => {
    try {
      const res = await api.patch(`/listings/${id}/statut`, { statut });
      setAnnonces(prev => prev.map(a => a._id === id ? res.data.annonce : a));
      toast.success('Statut mis à jour.');
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  const handleMarquerLu = async (msgId) => {
    await api.patch(`/messages/${msgId}/lu`);
    setMessages(prev => prev.map(m => m._id === msgId ? { ...m, lu: true } : m));
  };

  if (chargement) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  const nonLus = messages.filter(m => !m.lu).length;

  return (
    <div className="page container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-titre">Mon espace</h1>
          <p>Bonjour, <strong>{user.nom}</strong></p>
        </div>
        <Link to="/nouvelle-annonce" className="btn btn-primary">+ Nouvelle annonce</Link>
      </div>

      <div className="onglets">
        <button className={`onglet ${onglet === 'annonces' ? 'actif' : ''}`} onClick={() => setOnglet('annonces')}>
          Mes annonces <span className="badge-count">{annonces.length}</span>
        </button>
        <button className={`onglet ${onglet === 'messages' ? 'actif' : ''}`} onClick={() => setOnglet('messages')}>
          Messages {nonLus > 0 && <span className="badge-count rouge">{nonLus}</span>}
        </button>
      </div>

      {onglet === 'annonces' && (
        annonces.length === 0 ? (
          <div className="vide-dashboard">
            <p>Vous n'avez pas encore d'annonces.</p>
            <Link to="/nouvelle-annonce" className="btn btn-primary" style={{ marginTop: '1rem' }}>Créer ma première annonce</Link>
          </div>
        ) : (
          <div className="annonces-liste">
            {annonces.map(a => (
              <div key={a._id} className="annonce-row">
                <div className="annonce-row-img">
                  {a.photos[0] ? <img src={a.photos[0].url} alt={a.titre} /> : <div className="img-placeholder">📷</div>}
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
                  <Link to={`/modifier-annonce/${a._id}`} className="btn btn-sm btn-outline">Modifier</Link>
                  <button className="btn btn-sm btn-danger" onClick={() => handleSupprimer(a._id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {onglet === 'messages' && (
        messages.length === 0 ? (
          <div className="vide-dashboard"><p>Aucun message reçu pour le moment.</p></div>
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
    </div>
  );
}
