import { Router } from "express";
import authRoutes from "./auth.routes";
import employeeRoutes from "./employee.routes";
import advanceRoutes from "./advance.routes";
import payrollRoutes from "./payroll.routes";
import supportRoutes from "./support.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/advances", advanceRoutes);
router.use("/payroll", payrollRoutes);
router.use("/support", supportRoutes);

export default router;
