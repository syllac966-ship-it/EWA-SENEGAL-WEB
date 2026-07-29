import { Router } from "express";
import * as payrollController from "../controllers/payroll.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updatePayrollSettingsSchema } from "../validators/payrollSettings.validator";

const router = Router();

router.use(requireAuth);

// Salarié : consulte son propre salaire déjà gagné sur la période en cours.
router.get("/me/earned", payrollController.getMyEarnedSalary);

// Admin RH : consultation/paramétrage.
router.get("/employees/:employeeId/earned", requireRole("admin"), payrollController.getEmployeeEarnedSalary);
router.get("/settings", requireRole("admin"), payrollController.getSettings);
router.patch(
  "/settings",
  requireRole("admin"),
  validate(updatePayrollSettingsSchema),
  payrollController.updateSettings
);

export default router;
