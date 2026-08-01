import { query } from "../config/db";

export interface CreateSupportMessageInput {
  userId: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function createSupportMessage(input: CreateSupportMessageInput) {
  const result = await query(
    `INSERT INTO support_messages (user_id, name, email, subject, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [input.userId, input.name, input.email, input.subject, input.message]
  );

  // Simulation d'envoi vers l'équipe support (aucun provider réel configuré).
  console.log(`[SUPPORT] Nouveau message de ${input.email} — objet: ${input.subject}`);

  return result.rows[0];
}
