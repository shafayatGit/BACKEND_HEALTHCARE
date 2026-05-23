import { Router } from "express";
import { ScheduleControllers } from "./schedule.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../shared/validateRequest";
import { scheduleValidation } from "./schedule.validation";

const router = Router();
router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  validateRequest(scheduleValidation.createScheduleZodSchema),
  ScheduleControllers.createSchedule,
);

export const ScheduleRoutes = router;
