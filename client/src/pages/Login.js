import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { connexion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || null;
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [chargement, setChargement] = useState(false);
  const [afficherMdp, setAfficherMdp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const user = await connexion(form.email, form.motDePasse);
      toast.success(`Bienvenue, ${user.nom} !`);
      navigate(redirect || (user.role === 'admin' ? '/admin' : '/tableau-de-bord'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏠 Démarcheur</div>
        <h1>Bon retour !</h1>
        <p className="auth-sub">Connectez-vous à votre espace</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Adresse email</label>
            <input type="email" required autoComplete="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-password">
              <input type={afficherMdp ? 'text' : 'password'} required
                autoComplete="current-password" value={form.motDePasse}
                onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))}
                placeholder="Votre mot de passe" />
              <button type="button" className="toggle-mdp" onClick={() => setAfficherMdp(!afficherMdp)}>
                {afficherMdp ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={chargement} style={{ marginTop: '.5rem' }}>
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-divider"><hr /><span>Nouveau sur Démarcheur ?</span><hr /></div>

        <Link to="/inscription" className="btn btn-secondary btn-full">Créer un compte gratuit</Link>

        <p className="auth-footer" style={{ marginTop: '1rem' }}>
          Compte professionnel ? <Link to="/inscription/agence">Inscription agence</Link>
        </p>
      </div>
    </div>
  );
}
