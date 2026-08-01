import { pool } from "../config/db";
import { hashPassword } from "../utils/password";

async function seed() {
  console.log("Insertion des données de démonstration...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Paramètres de paie par défaut (une seule ligne)
    const settingsResult = await client.query(
      `SELECT id FROM payroll_settings LIMIT 1`
    );
    if (settingsResult.rowCount === 0) {
      await client.query(
        `INSERT INTO payroll_settings (working_days_per_month, advance_cap_percent, pay_period_start_day)
         VALUES (22, 50, 1)`
      );
    }

    // Entreprises partenaires (liste blanche utilisée à l'inscription en libre-service)
    const partnerCompanies = ["EWA Senegal Demo SARL", "Teranga Tech", "Dakar Logistics"];
    const companyIds: Record<string, string> = {};
    for (const name of partnerCompanies) {
      const existing = await client.query<{ id: string }>(`SELECT id FROM companies WHERE name = $1`, [name]);
      if (existing.rowCount && existing.rowCount > 0) {
        companyIds[name] = existing.rows[0]!.id;
      } else {
        const inserted = await client.query<{ id: string }>(
          `INSERT INTO companies (name) VALUES ($1) RETURNING id`,
          [name]
        );
        companyIds[name] = inserted.rows[0]!.id;
        console.log(`Entreprise partenaire créée: ${name}`);
      }
    }

    // Compte admin RH
    const adminEmail = "admin@ewa-senegal.sn";
    const adminPasswordHash = await hashPassword("Admin@2024!");
    const existingAdmin = await client.query(`SELECT id FROM users WHERE email = $1`, [adminEmail]);
    if (existingAdmin.rowCount === 0) {
      await client.query(
        `INSERT INTO users (email, password_hash, role, employee_id) VALUES ($1, $2, 'admin', NULL)`,
        [adminEmail, adminPasswordHash]
      );
      console.log(`Admin créé: ${adminEmail} / Admin@2024!`);
    }

    // Employé de démonstration
    const employeeEmail = "aissatou.diop@ewa-senegal.sn";
    const existingEmployee = await client.query(`SELECT id FROM employees WHERE email = $1`, [employeeEmail]);

    const demoCompanyId = companyIds["EWA Senegal Demo SARL"]!;

    let employeeId: string;
    if (existingEmployee.rowCount === 0) {
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO employees
           (employee_code, first_name, last_name, email, phone, department, company_id, monthly_salary, hire_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
         RETURNING id`,
        [
          "EMP-0001",
          "Aissatou",
          "Diop",
          employeeEmail,
          "+221771234567",
          "Opérations",
          demoCompanyId,
          350000,
          "2024-01-15",
        ]
      );
      employeeId = inserted.rows[0]!.id;
      console.log(`Employé créé: ${employeeEmail}`);
    } else {
      employeeId = existingEmployee.rows[0]!.id;
      await client.query(`UPDATE employees SET company_id = $1 WHERE id = $2 AND company_id IS NULL`, [
        demoCompanyId,
        employeeId,
      ]);
    }

    const employeePasswordHash = await hashPassword("Salarie@2024!");
    const existingEmployeeUser = await client.query(`SELECT id FROM users WHERE email = $1`, [employeeEmail]);
    if (existingEmployeeUser.rowCount === 0) {
      await client.query(
        `INSERT INTO users (email, password_hash, role, employee_id) VALUES ($1, $2, 'employee', $3)`,
        [employeeEmail, employeePasswordHash, employeeId]
      );
      console.log(`Compte salarié créé: ${employeeEmail} / Salarie@2024!`);
    }

    // Jours travaillés simulés depuis le début du mois en cours
    const attendanceResult = await client.query(
      `SELECT COUNT(*)::int AS count FROM attendance_records
       WHERE employee_id = $1 AND work_date >= date_trunc('month', CURRENT_DATE)`,
      [employeeId]
    );
    if (attendanceResult.rows[0]!.count === 0) {
      const today = new Date();
      const daysToInsert = Math.min(today.getDate(), 12); // jusqu'à 12 jours ouvrés simulés
      for (let i = 0; i < daysToInsert; i++) {
        const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue; // ignorer week-ends
        await client.query(
          `INSERT INTO attendance_records (employee_id, work_date)
           VALUES ($1, $2) ON CONFLICT (employee_id, work_date) DO NOTHING`,
          [employeeId, date.toISOString().slice(0, 10)]
        );
      }
      console.log("Jours travaillés simulés ajoutés.");
    }

    await client.query("COMMIT");
    console.log("Seed terminé avec succès.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Échec du seed:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
