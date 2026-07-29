import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ForbiddenError, UnauthorizedError } from "../utils/AppError";
import * as payrollService from "../services/payroll.service";
import type { UpdatePayrollSettingsInput } from "../validators/payrollSettings.validator";

export const getMyEarnedSalary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.employeeId) {
    throw new ForbiddenError("Réservé aux comptes salarié.");
  }
  const summary = await payrollService.computeEarnedSalary(req.user.employeeId);
  res.json(summary);
});

export const getEmployeeEarnedSalary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await payrollService.computeEarnedSalary(req.params.employeeId as string);
  res.json(summary);
});

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await payrollService.getPayrollSettings();
  res.json(settings);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const settings = await payrollService.updatePayrollSettings(
    req.body as UpdatePayrollSettingsInput,
    req.user.sub
  );
  res.json(settings);
});
