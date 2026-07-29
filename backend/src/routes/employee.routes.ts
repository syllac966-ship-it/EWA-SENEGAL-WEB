import { Router } from "express";
import * as employeeController from "../controllers/employee.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createEmployeeSchema,
  recordAttendanceSchema,
  updateEmployeeSchema,
} from "../validators/employee.validator";

const router = Router();

// Toutes les routes de gestion des employés sont réservées à l'admin RH.
router.use(requireAuth, requireRole("admin"));

router.get("/", employeeController.list);
router.post("/", validate(createEmployeeSchema), employeeController.create);
router.get("/:id", employeeController.getById);
router.patch("/:id", validate(updateEmployeeSchema), employeeController.update);
router.post("/attendance", validate(recordAttendanceSchema), employeeController.recordAttendance);

export default router;
