import { z } from "zod";

const phoneRegex = /^\+?[0-9]{9,13}$/;

export const createAdvanceRequestSchema = z.object({
  requestedAmount: z.coerce.number().positive("Le montant demandé doit être positif"),
  paymentMethod: z.enum(["wave", "orange_money"]),
  paymentPhone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),
});

export const reviewAdvanceRequestSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().trim().max(500).optional(),
});

export type CreateAdvanceRequestInput = z.infer<typeof createAdvanceRequestSchema>;
export type ReviewAdvanceRequestInput = z.infer<typeof reviewAdvanceRequestSchema>;
