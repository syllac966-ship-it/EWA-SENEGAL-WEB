import { env } from "../config/env";

/**
 * SIMULATION UNIQUEMENT — aucun envoi d'email réel (pas de provider SMTP
 * configuré). Le lien est loggé côté serveur, comme le mock des paiements
 * Wave/Orange Money. À remplacer par un vrai provider (Resend, SES, etc.)
 * lors de l'intégration réelle.
 */
async function simulateSend(to: string, subject: string, body: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 150));
  console.log(`[EMAIL SIMULÉ] À: ${to} — Objet: ${subject}\n${body}`);
}

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;
  await simulateSend(
    to,
    "Réinitialisation de votre mot de passe EWA Senegal",
    `Cliquez sur ce lien pour réinitialiser votre mot de passe (valable 1 heure) :\n${resetUrl}`
  );
}
