const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const envoyerEmail = async ({ to, subject, html }) => {
  // Si pas configuré, log en console (dev mode)
  if (!process.env.EMAIL_USER) {
    console.log(`📧 [EMAIL DEV] À: ${to} | Sujet: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"Démarcheur" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

exports.envoyerVerification = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verifier-email/${token}`;
  await envoyerEmail({
    to: user.email,
    subject: 'Vérifiez votre adresse email - Démarcheur',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h1 style="color:#1a6b3a;margin-bottom:8px;">🏠 Démarcheur</h1>
        <h2 style="color:#1a1a2e;">Bienvenue, ${user.nom} !</h2>
        <p style="color:#4a5568;">Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et activer votre compte.</p>
        <a href="${url}" style="display:inline-block;background:#1a6b3a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
          Vérifier mon email
        </a>
        <p style="color:#718096;font-size:13px;">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
    `,
  });
};

exports.envoyerConfirmationAgence = async (user) => {
  await envoyerEmail({
    to: user.email,
    subject: 'Demande d\'agence reçue - Démarcheur',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h1 style="color:#1a6b3a;">🏠 Démarcheur</h1>
        <h2>Demande reçue, ${user.nom} !</h2>
        <p style="color:#4a5568;">Votre demande de compte agence pour <strong>${user.agence.nomEntreprise}</strong> a bien été reçue.</p>
        <p style="color:#4a5568;">Notre équipe va examiner votre dossier et vous contacter sous 24-48h.</p>
        <div style="background:#fef3c7;padding:16px;border-radius:8px;margin-top:16px;">
          <p style="color:#92400e;margin:0;">⏳ <strong>Statut :</strong> En cours d'examen</p>
        </div>
      </div>
    `,
  });
};

exports.envoyerValidationAgence = async (user, approuve) => {
  await envoyerEmail({
    to: user.email,
    subject: approuve ? '✅ Compte agence approuvé - Démarcheur' : '❌ Demande agence refusée - Démarcheur',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h1 style="color:#1a6b3a;">🏠 Démarcheur</h1>
        ${approuve
          ? `<h2 style="color:#065f46;">✅ Compte approuvé !</h2>
             <p>Félicitations ${user.nom} ! Votre compte agence <strong>${user.agence.nomEntreprise}</strong> a été approuvé.</p>
             <p>Vous pouvez maintenant publier des annonces sans limite.</p>
             <a href="${process.env.CLIENT_URL}/tableau-de-bord" style="display:inline-block;background:#1a6b3a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">
               Accéder à mon espace
             </a>`
          : `<h2 style="color:#991b1b;">❌ Demande refusée</h2>
             <p>Nous sommes désolés, votre demande de compte agence n'a pas été approuvée.</p>
             <p>Contactez notre support pour plus d'informations.</p>`
        }
      </div>
    `,
  });
};
