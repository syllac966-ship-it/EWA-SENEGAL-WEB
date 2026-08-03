import { z } from "zod";

const phoneRegex = /^\+?[0-9]{9,13}$/;
const passwordSchema = z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),
  companyName: z.string().trim().min(1, "Le nom de l'entreprise est requis").max(150),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Jeton manquant"),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: passwordSchema,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Mot de passe requis pour confirmer la suppression"),
});

export const verifyPasswordSchema = z.object({
  password: z.string().min(1, "Mot de passe requis"),
});

export const updateProfileSchema = z.object({
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
