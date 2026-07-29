import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError";

type Source = "body" | "query" | "params";

/**
 * Valide et assainit req[source] avec un schéma Zod. Remplace la donnée brute
 * par la donnée validée (types coercés, champs inconnus retirés).
 */
export function validate(schema: ZodTypeAny, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new AppError(`Données invalides — ${message}`, 422);
    }
    req[source] = result.data;
    next();
  };
}
