import { query } from "../config/db";
import { NotFoundError } from "../utils/AppError";
import type { PayrollSettings } from "../types";

export interface PayPeriod {
  start: Date;
  end: Date;
}

export interface EarnedSalarySummary {
  periodStart: string;
  periodEnd: string;
  workingDaysPerMonth: number;
  dailyRate: number;
  workedDays: number;
  monthlySalary: number;
  earnedAmount: number;
  advanceCapPercent: number;
  capAmount: number;
  alreadyRequestedAmount: number;
  availableForAdvance: number;
  serviceFeePercent: number;
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Calcule la période de paie en cours à partir du jour de démarrage
 * configuré (pay_period_start_day), par rapport à la date du jour.
 */
export function getCurrentPayPeriod(payPeriodStartDay: number, reference = new Date()): PayPeriod {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const day = reference.getDate();

  let start: Date;
  if (day >= payPeriodStartDay) {
    start = new Date(year, month, payPeriodStartDay);
  } else {
    start = new Date(year, month - 1, payPeriodStartDay);
  }

  const end = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate() - 1);
  return { start, end };
}

export async function getPayrollSettings(): Promise<PayrollSettings> {
  const result = await query<PayrollSettings>(
    `SELECT * FROM payroll_settings ORDER BY updated_at DESC LIMIT 1`
  );
  const settings = result.rows[0];
  if (!settings) {
    throw new NotFoundError("Paramètres de paie non configurés");
  }
  return settings;
}

export async function updatePayrollSettings(
  updates: Partial<{
    workingDaysPerMonth: number;
    advanceCapPercent: number;
    payPeriodStartDay: number;
    serviceFeePercent: number;
  }>,
  updatedBy: string
): Promise<PayrollSettings> {
  const current = await getPayrollSettings();

  const workingDaysPerMonth = updates.workingDaysPerMonth ?? current.working_days_per_month;
  const advanceCapPercent = updates.advanceCapPercent ?? Number(current.advance_cap_percent);
  const payPeriodStartDay = updates.payPeriodStartDay ?? current.pay_period_start_day;
  const serviceFeePercent = updates.serviceFeePercent ?? Number(current.service_fee_percent);

  const result = await query<PayrollSettings>(
    `UPDATE payroll_settings
     SET working_days_per_month = $1,
         advance_cap_percent = $2,
         pay_period_start_day = $3,
         service_fee_percent = $4,
         updated_at = now(),
         updated_by = $5
     WHERE id = $6
     RETURNING *`,
    [workingDaysPerMonth, advanceCapPercent, payPeriodStartDay, serviceFeePercent, updatedBy, current.id]
  );
  return result.rows[0]!;
}

/**
 * Calcule le salaire déjà gagné par un employé sur la période de paie en
 * cours (jours travaillés x taux journalier), ainsi que le plafond
 * d'avance disponible compte tenu des demandes déjà en cours/payées.
 */
export async function computeEarnedSalary(employeeId: string): Promise<EarnedSalarySummary> {
  const settings = await getPayrollSettings();
  const { start, end } = getCurrentPayPeriod(settings.pay_period_start_day);

  const employeeResult = await query<{ monthly_salary: string }>(
    `SELECT monthly_salary FROM employees WHERE id = $1`,
    [employeeId]
  );
  const employee = employeeResult.rows[0];
  if (!employee) {
    throw new NotFoundError("Employé introuvable");
  }

  const workedDaysResult = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM attendance_records
     WHERE employee_id = $1 AND work_date BETWEEN $2 AND $3`,
    [employeeId, toDateOnly(start), toDateOnly(end)]
  );
  const workedDays = Number(workedDaysResult.rows[0]!.count);

  const dailyRate = Number(employee.monthly_salary) / settings.working_days_per_month;
  const earnedAmount = Math.round(dailyRate * workedDays * 100) / 100;
  const advanceCapPercent = Number(settings.advance_cap_percent);
  const capAmount = Math.round(earnedAmount * (advanceCapPercent / 100) * 100) / 100;

  const alreadyRequestedResult = await query<{ total: string | null }>(
    `SELECT COALESCE(SUM(requested_amount), 0) AS total FROM advance_requests
     WHERE employee_id = $1
       AND period_start = $2
       AND period_end = $3
       AND status IN ('pending', 'approved', 'paid')`,
    [employeeId, toDateOnly(start), toDateOnly(end)]
  );
  const alreadyRequestedAmount = Number(alreadyRequestedResult.rows[0]!.total ?? 0);
  const availableForAdvance = Math.max(0, Math.round((capAmount - alreadyRequestedAmount) * 100) / 100);

  return {
    periodStart: toDateOnly(start),
    periodEnd: toDateOnly(end),
    workingDaysPerMonth: settings.working_days_per_month,
    dailyRate: Math.round(dailyRate * 100) / 100,
    workedDays,
    monthlySalary: Number(employee.monthly_salary),
    earnedAmount,
    advanceCapPercent,
    capAmount,
    alreadyRequestedAmount,
    availableForAdvance,
    serviceFeePercent: Number(settings.service_fee_percent),
  };
}
