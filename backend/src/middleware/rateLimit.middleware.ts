import rateLimit from "express-rate-limit";

/**
 * Limite le brute-force sur les endpoints d'authentification.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives. Réessayez dans quelques minutes." },
});

/**
 * Limite générale appliquée à toute l'API.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes. Ralentissez." },
});
