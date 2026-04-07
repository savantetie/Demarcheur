import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Auth.css';
import './RegisterAgency.css';

const VILLES = ['Conakry', 'Kindia', 'Labé', 'Kankan', 'Nzérékoré', 'Boké', 'Mamou', 'Faranah', 'Siguiri'];

export default function RegisterAgency() {
  const { inscriptionAgence } = useAuth();
  const navigate = useNavigate();
  const [etape, setEtape] = useState(1);
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '', motDePasse: '', confirm: '',
    nomEntreprise: '', numeroEnregistrement: '', adresse: '', ville: '', siteWeb: '', description: '',
  });
  const [chargement, setChargement] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validerEtape1 = () => {
    if (!form.nom || !form.email || !form.telephone || !form.motDePasse) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return false;
    }
    if (form.motDePasse.length < 8) { toast.error('Mot de passe trop court (min. 8 caractères).'); return false; }
    if (form.motDePasse !== form.confirm) { toast.error('Les mots de passe ne correspondent pas.'); return false; }
    return true;
  };

  const validerEtape2 = () => {
    if (!form.nomEntreprise) { toast.error("Le nom de l'entreprise est obligatoire."); return false; }
    return true;
  };

  const handleSuivant = () => {
    if (etape === 1 && validerEtape1()) setEtape(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validerEtape2()) return;
    setChargement(true);
    try {
      const res = await inscriptionAgence({
        nom: form.nom, email: form.email, telephone: form.telephone, motDePasse: form.motDePasse,
        nomEntreprise: form.nomEntreprise, numeroEnregistrement: form.numeroEnregistrement,
        adresse: form.adresse, ville: form.ville, siteWeb: form.siteWeb, description: form.description,
      });

      toast.success(res.message || 'Demande soumise !');
      navigate('/tableau-de-bord');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-page agency-page">
      <div className="auth-card auth-card-lg">
        <Link to="/inscription" className="auth-back">← Retour</Link>
        <div className="auth-logo">🏠 Démarcheur</div>
        <h1>Compte Professionnel</h1>
        <p className="auth-sub">Créez votre profil agence et publiez en illimité</p>

        {/* Étapes */}
        <div className="agency-steps">
          <div className={`agency-step ${etape >= 1 ? 'actif' : ''}`}>
            <div className="step-num">1</div>
            <span>Informations personnelles</span>
          </div>
          <div className="step-line" />
          <div className={`agency-step ${etape >= 2 ? 'actif' : ''}`}>
            <div className="step-num">2</div>
            <span>Informations entreprise</span>
          </div>
        </div>

        {/* Étape 1 */}
        {etape === 1 && (
          <div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Nom du responsable *</label>
                <input required value={form.nom} onChange={set('nom')} placeholder="Mamadou Diallo" />
              </div>
              <div className="form-group">
                <label>Téléphone *</label>
                <input type="tel" required value={form.telephone} onChange={set('telephone')} placeholder="+224 628 000 000" />
              </div>
            </div>
            <div className="form-group">
              <label>Email professionnel *</label>
              <input type="email" required value={form.email} onChange={set('email')} placeholder="contact@agence.com" />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Mot de passe *</label>
                <input type="password" required minLength={8} value={form.motDePasse} onChange={set('motDePasse')} placeholder="Min. 8 caractères" />
              </div>
              <div className="form-group">
                <label>Confirmer *</label>
                <input type="password" required value={form.confirm} onChange={set('confirm')} placeholder="Répéter le mot de passe" />
              </div>
            </div>
            <button type="button" className="btn btn-primary btn-full btn-lg" onClick={handleSuivant} style={{ marginTop: '.5rem' }}>
              Continuer →
            </button>
          </div>
        )}

        {/* Étape 2 */}
        {etape === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom de l'entreprise / agence *</label>
              <input required value={form.nomEntreprise} onChange={set('nomEntreprise')} placeholder="Agence Immobilière Guinée" />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>N° d'enregistrement</label>
                <input value={form.numeroEnregistrement} onChange={set('numeroEnregistrement')} placeholder="RCCM / NIF" />
              </div>
              <div className="form-group">
                <label>Ville principale</label>
                <select value={form.ville} onChange={set('ville')}>
                  <option value="">Sélectionner</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Adresse</label>
              <input value={form.adresse} onChange={set('adresse')} placeholder="Rue Roi Baudouin, Kaloum, Conakry" />
            </div>
            <div className="form-group">
              <label>Site web</label>
              <input type="url" value={form.siteWeb} onChange={set('siteWeb')} placeholder="https://monagence.com" />
            </div>
            <div className="form-group">
              <label>Présentation de l'agence</label>
              <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Décrivez votre agence, votre spécialité, vos années d'expérience..." />
            </div>

            <div className="agency-info-box">
              ℹ️ Votre compte sera examiné par notre équipe sous <strong>24-48h</strong>.
            </div>

            <div className="form-actions-row">
              <button type="button" className="btn btn-secondary" onClick={() => setEtape(1)}>← Retour</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={chargement}>
                {chargement ? 'Envoi...' : 'Soumettre ma demande'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer">Déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
      </div>
    </div>
  );
}
