import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as employeeService from "../services/employee.service";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "../validators/employee.validator";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.createEmployee(req.body as CreateEmployeeInput);
  res.status(201).json(employee);
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const employees = await employeeService.listEmployees();
  res.json(employees);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.getEmployeeById(req.params.id as string);
  res.json(employee);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.updateEmployee(
    req.params.id as string,
    req.body as UpdateEmployeeInput
  );
  res.json(employee);
});

export const recordAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { employeeId, workDate } = req.body as { employeeId: string; workDate: string };
  await employeeService.recordAttendance(employeeId, workDate);
  res.status(201).json({ message: "Jour travaillé enregistré." });
});
