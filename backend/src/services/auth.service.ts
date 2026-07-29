import { query } from "../config/db";
import { UnauthorizedError } from "../utils/AppError";
import { verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import type { AppUser } from "../types";

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: "employee" | "admin";
    employeeId: string | null;
  };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const result = await query<AppUser>(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = result.rows[0];

  // Message volontairement générique pour ne pas révéler si l'email existe.
  if (!user || !user.is_active) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  const token = signToken({
    sub: user.id,
    role: user.role,
    employeeId: user.employee_id,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee_id,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const result = await query<AppUser>(`SELECT * FROM users WHERE id = $1`, [userId]);
  const user = result.rows[0];
  if (!user) {
    throw new UnauthorizedError();
  }
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employee_id,
  };
}
