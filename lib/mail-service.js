import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'noreply@mydbs.fr',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendCredentialsEmail = async ({ to, firstName, lastName, userCode, password, role }) => {
  const subject = `[MyDBS] Vos identifiants de connexion — ${role}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mydbs.fr';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; padding: 30px; line-height: 1.6;">
      <h2 style="color: #3b82f6; margin-top: 0;">Bienvenue chez MyDBS !</h2>
      <p>Bonjour ${firstName} ${lastName},</p>
      <p>Votre compte <strong>${role}</strong> a été créé avec succès par l'administration.</p>

      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <p style="margin-top: 0; font-weight: bold; font-size: 14px; text-transform: uppercase; color: #64748b;">Vos accès :</p>
        <p style="margin-bottom: 5px;"><strong>Identifiant (Code) :</strong> ${userCode}</p>
        <p style="margin-bottom: 5px;"><strong>Email :</strong> ${to}</p>
        <p style="margin-top: 15px;"><strong>Mot de passe temporaire :</strong> <code style="background: #e2e8f0; padding: 2px 5px; border-radius: 4px;">${password}</code></p>
      </div>

      <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #9a3412; font-weight: bold; font-size: 13px;">
          ⚠️ Action requise : changez votre mot de passe lors de votre première connexion.
        </p>
        <p style="margin: 8px 0 0; color: #9a3412; font-size: 12px;">
          Ce mot de passe est temporaire. Ne le partagez avec personne. Supprimez cet email après vous être connecté.
        </p>
      </div>

      <p>Connectez-vous et changez votre mot de passe immédiatement :</p>
      <a href="${appUrl}/premiere-connexion" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 15px 0;">Première connexion →</a>

      <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
        Ceci est un message automatique, merci de ne pas y répondre.<br/>
        Si vous n'êtes pas à l'origine de cette demande, contactez immédiatement le support.
      </p>
    </div>
  `;

  return transporter.sendMail({
    from: `"MyDBS" <${process.env.SMTP_USER || 'noreply@mydbs.fr'}>`,
    to,
    subject,
    html,
  });
};
