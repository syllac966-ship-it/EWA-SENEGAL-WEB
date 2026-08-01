import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ForbiddenError, UnauthorizedError } from "../utils/AppError";
import * as authService from "../services/auth.service";
import * as employeeService from "../services/employee.service";
import type {
  ChangePasswordInput,
  DeleteAccountInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "../validators/auth.validator";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  const result = await authService.login(email, password);
  res.json(result);
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body as RegisterInput);
  res.status(201).json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const user = await authService.getCurrentUser(req.user.sub);
  res.json(user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.employeeId) {
    throw new ForbiddenError("Réservé aux comptes salarié.");
  }
  const { phone } = req.body as UpdateProfileInput;
  await employeeService.updateOwnPhone(req.user.employeeId, phone);
  const profile = await authService.getCurrentUser(req.user.sub);
  res.json(profile);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;
  await authService.requestPasswordReset(email);
  // Réponse volontairement identique que l'email existe ou non.
  res.json({ message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as ResetPasswordInput;
  await authService.resetPassword(token, newPassword);
  res.json({ message: "Mot de passe réinitialisé avec succès." });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;
  await authService.changePassword(req.user.sub, currentPassword, newPassword);
  res.json({ message: "Mot de passe modifié avec succès." });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const { password } = req.body as DeleteAccountInput;
  await authService.deleteAccount(req.user.sub, password);
  res.json({ message: "Compte supprimé." });
});
