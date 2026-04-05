import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './PaymentPage.css';

const ICONS = { basic: '⚡', premium: '🌟', elite: '👑' };
const NUMERO_ADMIN = '610100165';

export default function PaymentPage() {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [methode, setMethode] = useState('orange_money');
  const [numeroExpediteur, setNumeroExpediteur] = useState(user?.telephone || '');
  const [noteClient, setNoteClient] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [confirmation, setConfirmation] = useState(null); // { reference, plan }
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/connexion'); return; }
    if (user.role !== 'agency') { toast.error('Réservé aux agences.'); navigate('/tarifs'); return; }
    if (!user.agence?.valide) { toast.error('Votre compte agence doit être validé.'); navigate('/tableau-de-bord'); return; }

    api.get('/subscriptions/plans').then(r => {
      const p = r.data.plans[planId];
      if (!p || planId === 'gratuit') { navigate('/tarifs'); return; }
      setPlan(p);
      setChargement(false);
    });
  }, [planId, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!numeroExpediteur.trim()) return toast.error('Veuillez indiquer le numéro utilisé pour le paiement.');
    setEnvoi(true);
    try {
      const res = await api.post('/subscriptions/souscrire', {
        planId,
        methode,
        numeroExpediteur: numeroExpediteur.trim(),
        noteClient: noteClient.trim(),
      });
      setConfirmation(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la soumission.');
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  const prix = new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(plan.prix) + ' GNF';

  // ===== ÉCRAN DE CONFIRMATION =====
  if (confirmation) {
    return (
      <div className="payment-page">
        <div className="container payment-container">
          <div className="payment-success">
            <div className="success-icon">✅</div>
            <h1>Paiement soumis !</h1>
            <p>Votre demande d'abonnement <strong>{plan.nom}</strong> a bien été enregistrée.</p>

            <div className="success-ref">
              <span>Votre référence</span>
              <strong>{confirmation.reference}</strong>
            </div>

            <div className="success-steps">
              <div className="success-step done">
                <div className="ss-icon">✓</div>
                <div>
                  <strong>Paiement envoyé</strong>
                  <span>Vous avez envoyé {prix} au {NUMERO_ADMIN}</span>
                </div>
              </div>
              <div className="success-step active">
                <div className="ss-icon">2</div>
                <div>
                  <strong>Vérification admin</strong>
                  <span>Notre équipe vérifie la réception du paiement sous 24h</span>
                </div>
              </div>
              <div className="success-step">
                <div className="ss-icon">3</div>
                <div>
                  <strong>Activation du plan</strong>
                  <span>Votre plan {plan.nom} sera activé dès confirmation</span>
                </div>
              </div>
            </div>

            <div className="success-info">
              <p>Conservez votre référence <strong>{confirmation.reference}</strong> pour tout suivi.</p>
              <p>Vous serez notifié par email dès que votre plan est activé.</p>
            </div>

            <div className="success-actions">
              <Link to="/tableau-de-bord" className="btn btn-primary">Aller au tableau de bord</Link>
              <Link to="/tarifs" className="btn btn-outline">Retour aux tarifs</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== FORMULAIRE DE PAIEMENT =====
  return (
    <div className="payment-page">
      <div className="container payment-container">

        {/* Récapitulatif plan */}
        <div className="payment-plan-recap">
          <div className="recap-icon">{ICONS[planId]}</div>
          <div className="recap-info">
            <h2>Plan {plan.nom}</h2>
            <p className="recap-prix">{prix} <span>/ mois</span></p>
          </div>
          <Link to="/tarifs" className="recap-changer">Changer →</Link>
        </div>

        <div className="payment-layout">
          {/* Colonne gauche : instructions */}
          <div className="payment-instructions">
            <h3>Comment payer ?</h3>
            <p className="instructions-intro">
              Choisissez votre réseau, envoyez le montant exact au numéro ci-dessous, puis renseignez les informations à droite.
            </p>

            {/* Orange Money */}
            <div
              className={`methode-card ${methode === 'orange_money' ? 'active' : ''}`}
              onClick={() => setMethode('orange_money')}
            >
              <div className="methode-card-header">
                <span className="methode-logo om">OM</span>
                <div>
                  <strong>Orange Money</strong>
                  <span>Envoi mobile</span>
                </div>
                <div className={`methode-radio ${methode === 'orange_money' ? 'checked' : ''}`} />
              </div>
              {methode === 'orange_money' && (
                <div className="methode-card-detail">
                  <div className="numero-paiement">
                    <span className="numero-label">Numéro destinataire</span>
                    <span className="numero-value">{NUMERO_ADMIN}</span>
                    <button className="btn-copy" onClick={() => { navigator.clipboard.writeText(NUMERO_ADMIN); toast.success('Numéro copié !'); }}>
                      Copier
                    </button>
                  </div>
                  <ol className="steps-list">
                    <li>Composez <strong>#144#</strong> ou ouvrez l'app Orange Money</li>
                    <li>Choisissez <strong>"Envoyer de l'argent"</strong></li>
                    <li>Entrez le numéro <strong>{NUMERO_ADMIN}</strong></li>
                    <li>Entrez le montant : <strong>{prix}</strong></li>
                    <li>Validez et notez votre code de transaction</li>
                  </ol>
                </div>
              )}
            </div>

            {/* MTN Money */}
            <div
              className={`methode-card ${methode === 'mtn_money' ? 'active' : ''}`}
              onClick={() => setMethode('mtn_money')}
            >
              <div className="methode-card-header">
                <span className="methode-logo mtn">MTN</span>
                <div>
                  <strong>MTN Mobile Money</strong>
                  <span>Envoi mobile</span>
                </div>
                <div className={`methode-radio ${methode === 'mtn_money' ? 'checked' : ''}`} />
              </div>
              {methode === 'mtn_money' && (
                <div className="methode-card-detail">
                  <div className="numero-paiement">
                    <span className="numero-label">Numéro destinataire</span>
                    <span className="numero-value">{NUMERO_ADMIN}</span>
                    <button className="btn-copy" onClick={() => { navigator.clipboard.writeText(NUMERO_ADMIN); toast.success('Numéro copié !'); }}>
                      Copier
                    </button>
                  </div>
                  <ol className="steps-list">
                    <li>Composez <strong>*126#</strong> ou ouvrez l'app MTN MoMo</li>
                    <li>Choisissez <strong>"Transfert d'argent"</strong></li>
                    <li>Entrez le numéro <strong>{NUMERO_ADMIN}</strong></li>
                    <li>Entrez le montant : <strong>{prix}</strong></li>
                    <li>Validez et notez votre code de transaction</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Virement / Espèces */}
            <div
              className={`methode-card ${methode === 'especes' ? 'active' : ''}`}
              onClick={() => setMethode('especes')}
            >
              <div className="methode-card-header">
                <span className="methode-logo esp">💵</span>
                <div>
                  <strong>Espèces / Autre</strong>
                  <span>Remise en main propre</span>
                </div>
                <div className={`methode-radio ${methode === 'especes' ? 'checked' : ''}`} />
              </div>
              {methode === 'especes' && (
                <div className="methode-card-detail">
                  <p>Rendez-vous à nos bureaux ou contactez-nous au <strong>{NUMERO_ADMIN}</strong> pour convenir d'un mode de paiement.</p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite : formulaire de confirmation */}
          <div className="payment-form-col">
            <div className="payment-form-card">
              <h3>Confirmer votre paiement</h3>
              <p className="form-intro">
                Une fois le virement effectué, renseignez les informations ci-dessous. Notre équipe validera votre abonnement sous <strong>24h</strong>.
              </p>

              <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                  <label>Numéro utilisé pour le paiement <span className="required">*</span></label>
                  <input
                    type="tel"
                    placeholder="Ex : 621 23 45 67"
                    value={numeroExpediteur}
                    onChange={e => setNumeroExpediteur(e.target.value)}
                    required
                  />
                  <small>Le numéro depuis lequel vous avez envoyé l'argent</small>
                </div>

                <div className="form-group">
                  <label>Code de transaction (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex : TXN123456789"
                    value={noteClient}
                    onChange={e => setNoteClient(e.target.value)}
                  />
                  <small>Le code reçu par SMS après votre transaction</small>
                </div>

                <div className="payment-recap-box">
                  <div className="recap-row">
                    <span>Plan</span>
                    <strong>{plan.nom}</strong>
                  </div>
                  <div className="recap-row">
                    <span>Montant à envoyer</span>
                    <strong className="recap-montant">{prix}</strong>
                  </div>
                  <div className="recap-row">
                    <span>Numéro destinataire</span>
                    <strong>{NUMERO_ADMIN}</strong>
                  </div>
                  <div className="recap-row">
                    <span>Mode</span>
                    <strong>
                      {{ orange_money: 'Orange Money', mtn_money: 'MTN Money', especes: 'Espèces' }[methode]}
                    </strong>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={envoi}>
                  {envoi ? 'Soumission...' : "✓ J'ai effectué le paiement"}
                </button>

                <p className="form-disclaimer">
                  En cliquant, vous confirmez avoir envoyé <strong>{prix}</strong> au numéro <strong>{NUMERO_ADMIN}</strong>. Votre plan sera activé après vérification par notre équipe.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
