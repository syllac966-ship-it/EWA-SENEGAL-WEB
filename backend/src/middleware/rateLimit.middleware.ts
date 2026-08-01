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
 * Limite les abus sur les endpoints sensibles à faible fréquence d'usage
 * légitime : inscription et demande de réinitialisation de mot de passe
 * (création de compte en masse, spam d'emails de réinitialisation...).
 */
export const sensitiveActionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives. Réessayez dans une heure." },
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
