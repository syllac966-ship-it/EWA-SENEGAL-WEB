import { query } from "../config/db";
import type { Company } from "../types";

export async function findCompanyByName(name: string): Promise<Company | null> {
  const result = await query<Company>(`SELECT * FROM companies WHERE lower(name) = lower($1) LIMIT 1`, [
    name.trim(),
  ]);
  return result.rows[0] ?? null;
}

export async function listCompanies(): Promise<Company[]> {
  const result = await query<Company>(`SELECT * FROM companies ORDER BY name ASC`);
  return result.rows;
}
