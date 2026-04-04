import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { connexion } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const user = await connexion(form.email, form.motDePasse);
      toast.success(`Bienvenue, ${user.nom} !`);
      navigate(user.role === 'admin' ? '/admin' : '/tableau-de-bord');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏠 Démarcheur</div>
        <h1>Connexion</h1>
        <p className="auth-sub">Accédez à votre espace propriétaire</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" required value={form.motDePasse} onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={chargement}>
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-footer">
          Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
