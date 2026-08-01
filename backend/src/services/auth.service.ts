import crypto from "node:crypto";
import { query, withTransaction } from "../config/db";
import { AppError, ConflictError, UnauthorizedError } from "../utils/AppError";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { findCompanyByName } from "./company.service";
import { generateEmployeeCode } from "./employee.service";
import { sendPasswordResetEmail } from "./email.service";
import type { AppUser, CurrentUserProfile } from "../types";
import type { RegisterInput } from "../validators/auth.validator";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: "employee" | "admin";
    employeeId: string | null;
  };
}

function toLoginResult(user: AppUser): LoginResult {
  const token = signToken({ sub: user.id, role: user.role, employeeId: user.employee_id });
  return {
    token,
    user: { id: user.id, email: user.email, role: user.role, employeeId: user.employee_id },
  };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const result = await query<AppUser>(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = result.rows[0];

  // Message volontairement générique pour ne pas révéler si l'email existe.
  if (!user || !user.is_active || user.deleted_at) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  return toLoginResult(user);
}

/**
 * Inscription en libre-service d'un salarié. N'aboutit que si l'entreprise
 * indiquée fait partie de la liste des entreprises partenaires ; le compte
 * créé reste au statut 'pending' jusqu'à validation par un admin RH (qui
 * complètera salaire et date d'embauche).
 */
export async function register(input: RegisterInput): Promise<LoginResult> {
  const company = await findCompanyByName(input.companyName);
  if (!company) {
    throw new AppError(
      "Votre entreprise ne fait pas encore partie de nos partenaires. C'est pour bientôt !",
      404
    );
  }

  return withTransaction(async (client) => {
    const existingEmployee = await client.query(`SELECT id FROM employees WHERE email = $1`, [input.email]);
    const existingUser = await client.query(`SELECT id FROM users WHERE email = $1`, [input.email]);
    if ((existingEmployee.rowCount ?? 0) > 0 || (existingUser.rowCount ?? 0) > 0) {
      throw new ConflictError("Un compte existe déjà avec cet email.");
    }

    const employeeCode = await generateEmployeeCode(client);
    const passwordHash = await hashPassword(input.password);

    const employeeResult = await client.query<{ id: string }>(
      `INSERT INTO employees
         (employee_code, first_name, last_name, email, phone, company_id, hire_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, 'pending')
       RETURNING id`,
      [employeeCode, input.firstName, input.lastName, input.email, input.phone, company.id]
    );
    const employeeId = employeeResult.rows[0]!.id;

    const userResult = await client.query<AppUser>(
      `INSERT INTO users (email, password_hash, role, employee_id)
       VALUES ($1, $2, 'employee', $3)
       RETURNING *`,
      [input.email, passwordHash, employeeId]
    );

    return toLoginResult(userResult.rows[0]!);
  });
}

/**
 * Ne révèle jamais si l'email existe ou non (protection contre l'énumération
 * de comptes) : renvoie toujours succès côté appelant.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const result = await query<AppUser>(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = result.rows[0];
  if (!user || !user.is_active || user.deleted_at) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [user.id, tokenHash, expiresAt]
  );

  await sendPasswordResetEmail(user.email, rawToken);
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await withTransaction(async (client) => {
    const tokenResult = await client.query<{ id: string; user_id: string; expires_at: string; used_at: string | null }>(
      `SELECT * FROM password_reset_tokens WHERE token_hash = $1`,
      [tokenHash]
    );
    const resetToken = tokenResult.rows[0];

    if (!resetToken || resetToken.used_at || new Date(resetToken.expires_at) < new Date()) {
      throw new AppError("Ce lien de réinitialisation est invalide ou a expiré.", 400);
    }

    const passwordHash = await hashPassword(newPassword);
    await client.query(`UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`, [
      passwordHash,
      resetToken.user_id,
    ]);

    // Invalide ce jeton et tout autre jeton en attente pour cet utilisateur.
    await client.query(
      `UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL`,
      [resetToken.user_id]
    );
  });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const result = await query<AppUser>(`SELECT * FROM users WHERE id = $1`, [userId]);
  const user = result.rows[0];
  if (!user) {
    throw new UnauthorizedError();
  }

  const isValid = await verifyPassword(currentPassword, user.password_hash);
  if (!isValid) {
    throw new AppError("Mot de passe actuel incorrect.", 401);
  }

  const passwordHash = await hashPassword(newPassword);
  await query(`UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`, [passwordHash, userId]);
}

/**
 * Suppression de compte en soft delete : désactive l'accès (is_active =
 * false, deleted_at renseigné) sans jamais effacer les données historiques
 * (demandes d'avance, paiements, etc.).
 */
export async function deleteAccount(userId: string, password: string): Promise<void> {
  const result = await query<AppUser>(`SELECT * FROM users WHERE id = $1`, [userId]);
  const user = result.rows[0];
  if (!user) {
    throw new UnauthorizedError();
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new AppError("Mot de passe incorrect.", 401);
  }

  await query(`UPDATE users SET is_active = false, deleted_at = now(), updated_at = now() WHERE id = $1`, [
    userId,
  ]);
}

export async function getCurrentUser(userId: string): Promise<CurrentUserProfile> {
  const result = await query<{
    id: string;
    email: string;
    role: "employee" | "admin";
    employee_id: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    employee_code: string | null;
    employee_status: CurrentUserProfile["employeeStatus"];
    company_name: string | null;
  }>(
    `SELECT
       u.id, u.email, u.role, u.employee_id,
       e.first_name, e.last_name, e.phone, e.employee_code, e.status AS employee_status,
       c.name AS company_name
     FROM users u
     LEFT JOIN employees e ON e.id = u.employee_id
     LEFT JOIN companies c ON c.id = e.company_id
     WHERE u.id = $1`,
    [userId]
  );
  const row = result.rows[0];
  if (!row) {
    throw new UnauthorizedError();
  }

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    employeeId: row.employee_id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    employeeCode: row.employee_code,
    employeeStatus: row.employee_status,
    companyName: row.company_name,
  };
}
