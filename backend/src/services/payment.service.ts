import type { PoolClient } from "pg";
import type { PaymentMethod } from "../types";

export interface MockPaymentResult {
  success: boolean;
  providerTransactionId: string;
  failureReason: string | null;
}

/**
 * SIMULATION UNIQUEMENT — aucun appel réseau réel vers Wave ou Orange Money.
 * À remplacer par les SDK/API officiels lors de l'intégration réelle
 * (voir services/payment.service.ts pour le point d'extension).
 */
async function simulateProviderCall(method: PaymentMethod): Promise<MockPaymentResult> {
  // Simule la latence réseau d'un provider de paiement mobile.
  await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 400));

  const prefix = method === "wave" ? "WAVE" : "OM";
  const providerTransactionId = `${prefix}-MOCK-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

  // 95% de succès simulé pour refléter les échecs occasionnels réels
  // (solde marchand, timeout opérateur, numéro invalide...).
  const success = Math.random() > 0.05;

  return {
    success,
    providerTransactionId,
    failureReason: success ? null : "Échec simulé du provider (timeout ou solde insuffisant)",
  };
}

export interface CreatePaymentInput {
  advanceRequestId: string;
  method: PaymentMethod;
  amount: number;
  phoneNumber: string;
}

/**
 * Simule l'envoi d'une avance vers Wave/Orange Money et enregistre le
 * résultat en base au sein de la transaction fournie par l'appelant.
 */
export async function mockProcessPayment(client: PoolClient, input: CreatePaymentInput) {
  const result = await simulateProviderCall(input.method);

  const paymentResult = await client.query(
    `INSERT INTO payments
       (advance_request_id, method, amount, phone_number, provider_transaction_id, status, failure_reason, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     RETURNING *`,
    [
      input.advanceRequestId,
      input.method,
      input.amount,
      input.phoneNumber,
      result.providerTransactionId,
      result.success ? "success" : "failed",
      result.failureReason,
    ]
  );

  return { payment: paymentResult.rows[0], ...result };
}
