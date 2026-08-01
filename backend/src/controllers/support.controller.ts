import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { UnauthorizedError } from "../utils/AppError";
import * as authService from "../services/auth.service";
import * as supportService from "../services/support.service";
import type { ContactMessageInput } from "../validators/support.validator";

export const contact = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const profile = await authService.getCurrentUser(req.user.sub);
  const { subject, message } = req.body as ContactMessageInput;

  const name =
    profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.email;

  await supportService.createSupportMessage({
    userId: profile.id,
    name,
    email: profile.email,
    subject,
    message,
  });

  res.status(201).json({ message: "Votre message a bien été envoyé. Notre équipe vous répondra sous peu." });
});
