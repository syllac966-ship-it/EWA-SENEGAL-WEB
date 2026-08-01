import { query, withTransaction } from "../config/db";
import { ConflictError, NotFoundError } from "../utils/AppError";
import { hashPassword } from "../utils/password";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "../validators/employee.validator";
import type { Employee } from "../types";

export async function generateEmployeeCode(client: import("pg").PoolClient): Promise<string> {
  const result = await client.query<{ count: string }>(`SELECT COUNT(*) AS count FROM employees`);
  const next = Number(result.rows[0]!.count) + 1;
  return `EMP-${String(next).padStart(4, "0")}`;
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  return withTransaction(async (client) => {
    const existing = await client.query(`SELECT id FROM employees WHERE email = $1`, [input.email]);
    if ((existing.rowCount ?? 0) > 0) {
      throw new ConflictError("Un employé avec cet email existe déjà.");
    }

    const employeeCode = await generateEmployeeCode(client);

    const employeeResult = await client.query<Employee>(
      `INSERT INTO employees
         (employee_code, first_name, last_name, email, phone, department, monthly_salary, hire_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
       RETURNING *`,
      [
        employeeCode,
        input.firstName,
        input.lastName,
        input.email,
        input.phone,
        input.department ?? null,
        input.monthlySalary,
        input.hireDate,
      ]
    );
    const employee = employeeResult.rows[0]!;

    const passwordHash = await hashPassword(input.initialPassword);
    await client.query(
      `INSERT INTO users (email, password_hash, role, employee_id) VALUES ($1, $2, 'employee', $3)`,
      [input.email, passwordHash, employee.id]
    );

    return employee;
  });
}

export async function listEmployees(): Promise<Employee[]> {
  const result = await query<Employee>(`SELECT * FROM employees ORDER BY created_at DESC`);
  return result.rows;
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const result = await query<Employee>(`SELECT * FROM employees WHERE id = $1`, [id]);
  const employee = result.rows[0];
  if (!employee) {
    throw new NotFoundError("Employé introuvable");
  }
  return employee;
}

export async function updateEmployee(id: string, updates: UpdateEmployeeInput): Promise<Employee> {
  const current = await getEmployeeById(id);

  const result = await query<Employee>(
    `UPDATE employees
     SET first_name = $1, last_name = $2, phone = $3, department = $4,
         monthly_salary = $5, hire_date = $6, status = $7, updated_at = now()
     WHERE id = $8
     RETURNING *`,
    [
      updates.firstName ?? current.first_name,
      updates.lastName ?? current.last_name,
      updates.phone ?? current.phone,
      updates.department ?? current.department,
      updates.monthlySalary ?? current.monthly_salary,
      updates.hireDate ?? current.hire_date,
      updates.status ?? current.status,
      id,
    ]
  );
  return result.rows[0]!;
}

/**
 * Mise à jour de profil en libre-service : un salarié ne peut modifier que
 * son propre numéro de téléphone (jamais son salaire, statut, etc.).
 */
export async function updateOwnPhone(employeeId: string, phone: string): Promise<Employee> {
  await getEmployeeById(employeeId);
  const result = await query<Employee>(
    `UPDATE employees SET phone = $1, updated_at = now() WHERE id = $2 RETURNING *`,
    [phone, employeeId]
  );
  return result.rows[0]!;
}

export async function recordAttendance(employeeId: string, workDate: string): Promise<void> {
  await getEmployeeById(employeeId);
  await query(
    `INSERT INTO attendance_records (employee_id, work_date)
     VALUES ($1, $2) ON CONFLICT (employee_id, work_date) DO NOTHING`,
    [employeeId, workDate]
  );
}

export async function listAttendanceForEmployee(employeeId: string, from: string, to: string) {
  const result = await query<{ work_date: string }>(
    `SELECT work_date FROM attendance_records
     WHERE employee_id = $1 AND work_date BETWEEN $2 AND $3
     ORDER BY work_date ASC`,
    [employeeId, from, to]
  );
  return result.rows;
}
