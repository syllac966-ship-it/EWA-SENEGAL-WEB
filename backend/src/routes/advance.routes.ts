import { Router } from "express";
import * as advanceController from "../controllers/advance.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createAdvanceRequestSchema, reviewAdvanceRequestSchema } from "../validators/advance.validator";

const router = Router();

router.use(requireAuth);

// Salarié
router.post("/", validate(createAdvanceRequestSchema), advanceController.create);
router.get("/me", advanceController.listMine);

// Admin RH
router.get("/", requireRole("admin"), advanceController.listAll);
router.post(
  "/:id/review",
  requireRole("admin"),
  validate(reviewAdvanceRequestSchema),
  advanceController.review
);

export default router;
