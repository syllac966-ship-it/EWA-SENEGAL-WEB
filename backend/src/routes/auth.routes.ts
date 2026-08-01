import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { authRateLimiter, sensitiveActionRateLimiter } from "../middleware/rateLimit.middleware";
import {
  changePasswordSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validator";

const router = Router();

router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/register", sensitiveActionRateLimiter, validate(registerSchema), authController.register);
router.post(
  "/forgot-password",
  sensitiveActionRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);

router.get("/me", requireAuth, authController.me);
router.patch("/me", requireAuth, validate(updateProfileSchema), authController.updateMe);
router.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  authController.changePassword
);
router.post(
  "/delete-account",
  requireAuth,
  validate(deleteAccountSchema),
  authController.deleteAccount
);

export default router;
