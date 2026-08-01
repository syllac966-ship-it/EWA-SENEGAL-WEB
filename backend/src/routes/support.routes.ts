import { Router } from "express";
import * as supportController from "../controllers/support.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { contactMessageSchema } from "../validators/support.validator";

const router = Router();

router.post("/contact", requireAuth, validate(contactMessageSchema), supportController.contact);

export default router;
