import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function RegisterUser() {
  const { inscriptionUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', motDePasse: '', confirm: '' });
  const [chargement, setChargement] = useState(false);
  const [afficherMdp, setAfficherMdp] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const force = (mdp) => {
    if (!mdp) return { niveau: 0, label: '', color: '' };
    let score = 0;
    if (mdp.length >= 8) score++;
    if (/[A-Z]/.test(mdp)) score++;
    if (/[0-9]/.test(mdp)) score++;
    if (/[^A-Za-z0-9]/.test(mdp)) score++;
    const niveaux = [
      { niveau: 1, label: 'Faible', color: '#ef4444' },
      { niveau: 2, label: 'Moyen', color: '#f59e0b' },
      { niveau: 3, label: 'Bien', color: '#3b82f6' },
      { niveau: 4, label: 'Fort', color: '#10b981' },
    ];
    return niveaux[score - 1] || niveaux[0];
  };

  const forceMdp = force(form.motDePasse);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.motDePasse !== form.confirm) return toast.error('Les mots de passe ne correspondent pas.');
    if (form.motDePasse.length < 8) return toast.error('Le mot de passe doit faire au moins 8 caractères.');
    setChargement(true);
    try {
      const res = await inscriptionUser({ nom: form.nom, email: form.email, telephone: form.telephone, motDePasse: form.motDePasse });
      toast.success(res.message || 'Compte créé avec succès !');
      navigate('/tableau-de-bord');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-lg">
        <Link to="/inscription" className="auth-back">← Retour</Link>
        <div className="auth-logo">🏠 Démarcheur</div>
        <h1>Créer un compte particulier</h1>
        <p className="auth-sub">Trouvez votre bien et publiez vos annonces gratuitement</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="form-group">
              <label>Nom complet *</label>
              <input required value={form.nom} onChange={set('nom')} placeholder="Jean Camara" />
            </div>
            <div className="form-group">
              <label>Téléphone *</label>
              <input type="tel" required value={form.telephone} onChange={set('telephone')} placeholder="+224 628 000 000" />
            </div>
          </div>

          <div className="form-group">
            <label>Adresse email *</label>
            <input type="email" required value={form.email} onChange={set('email')} placeholder="jean@example.com" />
          </div>

          <div className="form-group">
            <label>Mot de passe *</label>
            <div className="input-password">
              <input
                type={afficherMdp ? 'text' : 'password'}
                required minLength={8}
                value={form.motDePasse} onChange={set('motDePasse')}
                placeholder="Minimum 8 caractères"
              />
              <button type="button" className="toggle-mdp" onClick={() => setAfficherMdp(!afficherMdp)}>
                {afficherMdp ? '🙈' : '👁️'}
              </button>
            </div>
            {form.motDePasse && (
              <div className="force-mdp">
                <div className="force-barre">
                  {[1,2,3,4].map(n => (
                    <div key={n} className="force-segment" style={{ background: n <= forceMdp.niveau ? forceMdp.color : '#e2e8f0' }} />
                  ))}
                </div>
                <span style={{ color: forceMdp.color }}>{forceMdp.label}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe *</label>
            <input
              type="password" required
              value={form.confirm} onChange={set('confirm')}
              placeholder="Répétez le mot de passe"
              style={{ borderColor: form.confirm && form.confirm !== form.motDePasse ? '#ef4444' : undefined }}
            />
            {form.confirm && form.confirm !== form.motDePasse && (
              <span className="form-error">Les mots de passe ne correspondent pas</span>
            )}
          </div>

          <div className="form-cgv">
            <input type="checkbox" id="cgv" required />
            <label htmlFor="cgv">J'accepte les <a href="#!">conditions d'utilisation</a> et la <a href="#!">politique de confidentialité</a></label>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={chargement} style={{ marginTop: '.75rem' }}>
            {chargement ? 'Création...' : 'Créer mon compte gratuitement'}
          </button>
        </form>

        <p className="auth-footer">Déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
      </div>
    </div>
  );
}
