import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { inscription } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', motDePasse: '', confirm: '' });
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.motDePasse !== form.confirm) {
      return toast.error('Les mots de passe ne correspondent pas.');
    }
    setChargement(true);
    try {
      await inscription({ nom: form.nom, email: form.email, telephone: form.telephone, motDePasse: form.motDePasse });
      toast.success('Compte créé avec succès !');
      navigate('/tableau-de-bord');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setChargement(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏠 Démarcheur</div>
        <h1>Créer un compte</h1>
        <p className="auth-sub">Commencez à publier vos annonces gratuitement</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet</label>
            <input required value={form.nom} onChange={set('nom')} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input type="tel" required placeholder="+224 XXX XXX XXX" value={form.telephone} onChange={set('telephone')} />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" required minLength={6} value={form.motDePasse} onChange={set('motDePasse')} />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input type="password" required value={form.confirm} onChange={set('confirm')} />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={chargement}>
            {chargement ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ? <Link to="/connexion">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
