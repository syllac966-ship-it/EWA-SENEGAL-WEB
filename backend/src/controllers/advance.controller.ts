import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ForbiddenError, UnauthorizedError } from "../utils/AppError";
import * as advanceService from "../services/advance.service";
import type { CreateAdvanceRequestInput, ReviewAdvanceRequestInput } from "../validators/advance.validator";
import type { AdvanceStatus } from "../types";

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.employeeId) {
    throw new ForbiddenError("Réservé aux comptes salarié.");
  }
  const body = req.body as CreateAdvanceRequestInput;
  const request = await advanceService.createAdvanceRequest({
    employeeId: req.user.employeeId,
    requestedAmount: body.requestedAmount,
    paymentMethod: body.paymentMethod,
    paymentPhone: body.paymentPhone,
  });
  res.status(201).json(request);
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.employeeId) {
    throw new ForbiddenError("Réservé aux comptes salarié.");
  }
  const requests = await advanceService.listAdvanceRequestsForEmployee(req.user.employeeId);
  res.json(requests);
});

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as AdvanceStatus | undefined;
  const requests = await advanceService.listAllAdvanceRequests(status);
  res.json(requests);
});

export const totalThisMonth = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.employeeId) {
    throw new ForbiddenError("Réservé aux comptes salarié.");
  }
  const total = await advanceService.getTotalWithdrawnThisMonth(req.user.employeeId);
  res.json({ total });
});

export const review = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const { decision, rejectionReason } = req.body as ReviewAdvanceRequestInput;
  const request = await advanceService.reviewAdvanceRequest(
    req.params.id as string,
    req.user.sub,
    decision,
    rejectionReason
  );
  res.json(request);
});
