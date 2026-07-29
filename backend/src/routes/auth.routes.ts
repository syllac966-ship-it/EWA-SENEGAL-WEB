import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimit.middleware";
import { loginSchema } from "../validators/auth.validator";

const router = Router();

router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.get("/me", requireAuth, authController.me);

export default router;
