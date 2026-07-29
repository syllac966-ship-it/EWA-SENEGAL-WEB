import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route introuvable: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Erreurs de contrainte PostgreSQL (ex: unicité) -> message générique sûr
  if (typeof err === "object" && err !== null && "code" in err) {
    const pgError = err as { code?: string; constraint?: string };
    if (pgError.code === "23505") {
      res.status(409).json({ error: "Cette ressource existe déjà." });
      return;
    }
  }

  // Ne jamais exposer les détails internes (stack trace, requêtes SQL...) au client
  console.error("Erreur non gérée:", err);
  res.status(500).json({
    error: "Une erreur interne est survenue.",
    ...(env.isProduction ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
}
