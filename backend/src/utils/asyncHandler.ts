import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Enveloppe un handler async pour transmettre automatiquement les erreurs
 * rejetées au middleware d'erreur central (évite les try/catch répétitifs).
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
