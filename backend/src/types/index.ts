export type UserRole = "employee" | "admin";
export type EmployeeStatus = "active" | "inactive" | "pending";
export type PaymentMethod = "wave" | "orange_money";
export type AdvanceStatus = "pending" | "approved" | "rejected" | "paid" | "failed";
export type PaymentStatus = "pending" | "success" | "failed";

export interface JwtPayload {
  sub: string; // user id
  role: UserRole;
  employeeId: string | null;
}

export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string | null;
  company_id: string | null;
  monthly_salary: string;
  hire_date: string;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  employee_id: string | null;
  is_active: boolean;
  deleted_at: string | null;
}

export interface PayrollSettings {
  id: string;
  working_days_per_month: number;
  advance_cap_percent: string;
  pay_period_start_day: number;
  service_fee_percent: string;
  updated_at: string;
}

export interface AdvanceRequest {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  worked_days: number;
  daily_rate: string;
  earned_amount: string;
  cap_amount: string;
  requested_amount: string;
  service_fee_percent: string;
  fee_amount: string;
  total_deduction_amount: string;
  payment_method: PaymentMethod;
  payment_phone: string;
  status: AdvanceStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface CurrentUserProfile {
  id: string;
  email: string;
  role: UserRole;
  employeeId: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  employeeCode: string | null;
  employeeStatus: EmployeeStatus | null;
  companyName: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
