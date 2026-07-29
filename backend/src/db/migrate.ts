import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pool } from "../config/db";

async function migrate() {
  const schemaPath = join(__dirname, "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");

  console.log("Application du schéma de base de données...");
  try {
    await pool.query(schema);
    console.log("Schéma appliqué avec succès.");
  } catch (err) {
    console.error("Échec de la migration:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
