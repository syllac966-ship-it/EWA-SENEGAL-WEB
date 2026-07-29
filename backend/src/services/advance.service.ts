import { query, withTransaction } from "../config/db";
import { AppError, ForbiddenError, NotFoundError } from "../utils/AppError";
import { computeEarnedSalary } from "./payroll.service";
import { mockProcessPayment } from "./payment.service";
import type { AdvanceRequest, AdvanceStatus, PaymentMethod } from "../types";

export interface CreateAdvanceRequestInput {
  employeeId: string;
  requestedAmount: number;
  paymentMethod: PaymentMethod;
  paymentPhone: string;
}

export async function createAdvanceRequest(input: CreateAdvanceRequestInput): Promise<AdvanceRequest> {
  const summary = await computeEarnedSalary(input.employeeId);

  if (input.requestedAmount > summary.availableForAdvance) {
    throw new AppError(
      `Montant demandé (${input.requestedAmount} FCFA) supérieur au plafond disponible ` +
        `(${summary.availableForAdvance} FCFA, soit ${summary.advanceCapPercent}% du salaire déjà gagné).`,
      422
    );
  }

  // Frais de service : l'employé reçoit exactement le montant demandé, mais
  // demandé + frais est déduit de son salaire en fin de mois.
  const feeAmount = Math.round(input.requestedAmount * (summary.serviceFeePercent / 100) * 100) / 100;
  const totalDeductionAmount = Math.round((input.requestedAmount + feeAmount) * 100) / 100;

  const result = await query<AdvanceRequest>(
    `INSERT INTO advance_requests
       (employee_id, period_start, period_end, worked_days, daily_rate, earned_amount,
        cap_amount, requested_amount, service_fee_percent, fee_amount, total_deduction_amount,
        payment_method, payment_phone, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
     RETURNING *`,
    [
      input.employeeId,
      summary.periodStart,
      summary.periodEnd,
      summary.workedDays,
      summary.dailyRate,
      summary.earnedAmount,
      summary.capAmount,
      input.requestedAmount,
      summary.serviceFeePercent,
      feeAmount,
      totalDeductionAmount,
      input.paymentMethod,
      input.paymentPhone,
    ]
  );

  return result.rows[0]!;
}

export async function listAdvanceRequestsForEmployee(employeeId: string): Promise<AdvanceRequest[]> {
  const result = await query<AdvanceRequest>(
    `SELECT * FROM advance_requests WHERE employee_id = $1 ORDER BY created_at DESC`,
    [employeeId]
  );
  return result.rows;
}

export async function listAllAdvanceRequests(status?: AdvanceStatus) {
  const result = status
    ? await query(
        `SELECT ar.*, e.first_name, e.last_name, e.employee_code
         FROM advance_requests ar
         JOIN employees e ON e.id = ar.employee_id
         WHERE ar.status = $1
         ORDER BY ar.created_at DESC`,
        [status]
      )
    : await query(
        `SELECT ar.*, e.first_name, e.last_name, e.employee_code
         FROM advance_requests ar
         JOIN employees e ON e.id = ar.employee_id
         ORDER BY ar.created_at DESC`
      );
  return result.rows;
}

async function getRequestOrThrow(id: string): Promise<AdvanceRequest> {
  const result = await query<AdvanceRequest>(`SELECT * FROM advance_requests WHERE id = $1`, [id]);
  const request = result.rows[0];
  if (!request) {
    throw new NotFoundError("Demande d'avance introuvable");
  }
  return request;
}

/**
 * Traite la décision d'un admin RH sur une demande d'avance.
 * En cas d'approbation, déclenche immédiatement la simulation de paiement
 * (Wave/Orange Money) et fait passer la demande à 'paid' ou 'failed'.
 */
export async function reviewAdvanceRequest(
  requestId: string,
  reviewerId: string,
  decision: "approved" | "rejected",
  rejectionReason?: string
): Promise<AdvanceRequest> {
  return withTransaction(async (client) => {
    const existing = await getRequestOrThrow(requestId);
    if (existing.status !== "pending") {
      throw new ForbiddenError(`Cette demande a déjà été traitée (statut: ${existing.status}).`);
    }

    if (decision === "rejected") {
      const result = await client.query<AdvanceRequest>(
        `UPDATE advance_requests
         SET status = 'rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = now()
         WHERE id = $3
         RETURNING *`,
        [rejectionReason ?? null, reviewerId, requestId]
      );
      return result.rows[0]!;
    }

    await client.query(
      `UPDATE advance_requests SET status = 'approved', reviewed_by = $1, reviewed_at = now() WHERE id = $2`,
      [reviewerId, requestId]
    );

    const { success } = await mockProcessPayment(client, {
      advanceRequestId: existing.id,
      method: existing.payment_method,
      amount: Number(existing.requested_amount),
      phoneNumber: existing.payment_phone,
    });

    const finalResult = await client.query<AdvanceRequest>(
      `UPDATE advance_requests SET status = $1 WHERE id = $2 RETURNING *`,
      [success ? "paid" : "failed", requestId]
    );

    return finalResult.rows[0]!;
  });
}
