import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { UnauthorizedError, ForbiddenError } from "../utils/AppError";
import type { UserRole } from "../types";

/**
 * Vérifie le token JWT (Authorization: Bearer <token>) et attache
 * l'utilisateur authentifié à req.user.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token d'authentification manquant");
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new UnauthorizedError("Token invalide ou expiré");
  }
}

/**
 * Restreint l'accès à une route à un ou plusieurs rôles.
 * À utiliser après requireAuth.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Rôle insuffisant pour accéder à cette ressource");
    }
    next();
  };
}
