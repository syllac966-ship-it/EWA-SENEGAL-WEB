import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { UnauthorizedError } from "../utils/AppError";
import * as authService from "../services/auth.service";
import type { LoginInput } from "../validators/auth.validator";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  const result = await authService.login(email, password);
  res.json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const user = await authService.getCurrentUser(req.user.sub);
  res.json(user);
});
