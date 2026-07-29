import { z } from "zod";

const phoneRegex = /^\+?[0-9]{9,13}$/;

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),
  department: z.string().trim().max(100).optional(),
  monthlySalary: z.coerce.number().positive("Le salaire mensuel doit être positif"),
  hireDate: z.string().date("Date d'embauche invalide (format attendu: AAAA-MM-JJ)"),
  initialPassword: z
    .string()
    .min(8, "Le mot de passe temporaire doit contenir au moins 8 caractères"),
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().regex(phoneRegex).optional(),
  department: z.string().trim().max(100).optional(),
  monthlySalary: z.coerce.number().positive().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const recordAttendanceSchema = z.object({
  employeeId: z.string().uuid(),
  workDate: z.string().date(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
