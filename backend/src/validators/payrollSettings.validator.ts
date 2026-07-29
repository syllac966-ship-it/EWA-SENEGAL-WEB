import { z } from "zod";

export const updatePayrollSettingsSchema = z.object({
  workingDaysPerMonth: z.coerce.number().int().min(1).max(31).optional(),
  advanceCapPercent: z.coerce.number().positive().max(100).optional(),
  payPeriodStartDay: z.coerce.number().int().min(1).max(28).optional(),
  serviceFeePercent: z.coerce.number().min(0).max(100).optional(),
});

export type UpdatePayrollSettingsInput = z.infer<typeof updatePayrollSettingsSchema>;
