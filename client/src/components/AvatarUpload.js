import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './AvatarUpload.css';

export default function AvatarUpload({ size = 80 }) {
  const { user, setUser } = useAuth();
  const [chargement, setChargement] = useState(false);
  const [hover, setHover] = useState(false);
  const inputRef = useRef();

  const initiales = user?.nom
    ? user.nom.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleFichier = async (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;
    if (fichier.size > 3 * 1024 * 1024) {
      return toast.error('Image trop grande (max 3 Mo).');
    }
    setChargement(true);
    try {
      const data = new FormData();
      data.append('avatar', fichier);
      const res = await api.post('/auth/avatar', data);
      setUser(res.data.user);
      toast.success('Photo de profil mise à jour !');
    } catch {
      toast.error("Erreur lors de l'upload.");
    } finally {
      setChargement(false);
      inputRef.current.value = '';
    }
  };

  const handleSupprimer = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer votre photo de profil ?')) return;
    try {
      const res = await api.delete('/auth/avatar');
      setUser(res.data.user);
      toast.success('Photo supprimée.');
    } catch {
      toast.error('Erreur.');
    }
  };

  return (
    <div className="avatar-upload" style={{ '--size': size + 'px' }}>
      <div
        className={`avatar-circle ${hover ? 'hover' : ''} ${chargement ? 'loading' : ''}`}
        onClick={() => inputRef.current.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title="Changer la photo de profil"
      >
        {chargement ? (
          <div className="avatar-spinner" />
        ) : user?.avatar ? (
          <img src={user.avatar} alt={user.nom} />
        ) : (
          <span className="avatar-initiales">{initiales}</span>
        )}

        <div className="avatar-overlay">
          <span>📷</span>
        </div>
      </div>

      {user?.avatar && !chargement && (
        <button className="avatar-delete" onClick={handleSupprimer} title="Supprimer la photo">✕</button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFichier}
        style={{ display: 'none' }}
      />
    </div>
  );
}
