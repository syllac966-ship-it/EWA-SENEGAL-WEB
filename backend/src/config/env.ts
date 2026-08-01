import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 4000),
  // Liste blanche d'origines séparées par des virgules (ex: dev + preview local).
  corsOrigins: required("CORS_ORIGIN", "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  databaseUrl: required("DATABASE_URL"),

  // Utilisée pour construire les liens cliquables des emails (réinitialisation, etc.)
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),

  advanceCapPercent: Number(process.env.ADVANCE_CAP_PERCENT ?? 50),
};

if (env.isProduction && env.jwtSecret === "change_me_to_a_long_random_secret_in_production") {
  throw new Error("JWT_SECRET doit être remplacé par une valeur forte en production.");
}
