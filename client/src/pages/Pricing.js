import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Pricing.css';

const ICONS = { gratuit: '🆓', basic: '⚡', premium: '🌟', elite: '👑' };

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState({});
  const [abonnement, setAbonnement] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get('/subscriptions/plans').then(r => {
      setPlans(r.data.plans);
      setChargement(false);
    });
    if (user?.role === 'agency') {
      api.get('/subscriptions/mon-abonnement').then(r => setAbonnement(r.data.abonnement)).catch(() => {});
    }
  }, [user]);

  const handleChoisir = (planId) => {
    if (!user) return navigate('/connexion');
    if (user.role !== 'agency') return toast.error('Seules les agences peuvent souscrire à un plan.');
    if (!user.agence?.valide) return toast.error('Votre compte agence doit être validé avant de souscrire.');
    navigate(`/paiement/${planId}`);
  };

  if (chargement) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  const planOrder = ['gratuit', 'basic', 'premium', 'elite'];
  const planActuelId = abonnement?.plan || 'gratuit';

  return (
    <div className="pricing-page">
      <div className="pricing-hero">
        <h1>Choisissez votre plan</h1>
        <p>Des offres adaptées à chaque professionnel de l'immobilier en Guinée</p>
        {abonnement && (
          <div className="plan-actuel-badge">
            Plan actuel : <strong>{abonnement.plan?.toUpperCase()}</strong> — expire le {new Date(abonnement.dateFin).toLocaleDateString('fr-FR')}
          </div>
        )}
      </div>

      <div className="container pricing-grid">
        {planOrder.map(planId => {
          const plan = plans[planId];
          if (!plan) return null;
          const estActuel = planActuelId === planId && abonnement?.statut === 'actif';
          const estPopulaire = plan.populaire;

          return (
            <div key={planId} className={`plan-card ${estPopulaire ? 'populaire' : ''} ${estActuel ? 'actuel' : ''}`}>
              {estPopulaire && <div className="plan-badge-populaire">⭐ Populaire</div>}
              {estActuel && <div className="plan-badge-actuel">✓ Plan actuel</div>}

              <div className="plan-header">
                <span className="plan-icon">{ICONS[planId]}</span>
                <h2>{plan.nom}</h2>
                <div className="plan-prix">
                  {plan.prix === 0 ? (
                    <span className="prix-gratuit">Gratuit</span>
                  ) : (
                    <>
                      <span className="prix-montant">{new Intl.NumberFormat('fr-GN').format(plan.prix)}</span>
                      <span className="prix-devise"> GNF / mois</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}><span className="check">✓</span>{f}</li>
                ))}
              </ul>

              <div className="plan-footer">
                {planId === 'gratuit' ? (
                  !user ? (
                    <Link to="/inscription" className="btn btn-outline btn-block">Commencer gratuitement</Link>
                  ) : (
                    <span className="plan-inclus">Inclus par défaut</span>
                  )
                ) : estActuel ? (
                  <span className="plan-inclus">✓ Plan actif</span>
                ) : (
                  <button
                    className={`btn btn-block ${estPopulaire ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleChoisir(planId)}
                  >
                    Choisir {plan.nom}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bannière paiement mobile */}
      <div className="container">
        <div className="pricing-payment-banner">
          <div className="ppb-icons">
            <span className="ppb-logo om">OM</span>
            <span className="ppb-logo mtn">MTN</span>
          </div>
          <div className="ppb-text">
            <strong>Paiement par mobile money</strong>
            <p>Orange Money & MTN MoMo acceptés — activation sous 24h après réception du paiement</p>
          </div>
          <div className="ppb-numero">
            <span>Numéro de paiement</span>
            <strong>610 10 01 65</strong>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container pricing-faq">
        <h2>Questions fréquentes</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Comment fonctionne le paiement ?</h4>
            <p>Envoyez le montant exact au numéro 610100165 via Orange Money ou MTN Money, puis renseignez votre confirmation sur la page de paiement. L'admin valide sous 24h.</p>
          </div>
          <div className="faq-item">
            <h4>Combien de temps pour l'activation ?</h4>
            <p>Dès que l'équipe confirme la réception du paiement, généralement sous 24h en jours ouvrables.</p>
          </div>
          <div className="faq-item">
            <h4>Que sont les annonces boostées ?</h4>
            <p>Les annonces boostées apparaissent en tête des résultats de recherche avec un badge visible, maximisant leur visibilité.</p>
          </div>
          <div className="faq-item">
            <h4>Puis-je changer de plan ?</h4>
            <p>Oui, vous pouvez upgrader votre plan à tout moment. Le nouveau plan prend effet dès validation du paiement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
