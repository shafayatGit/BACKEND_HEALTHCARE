import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import z from "zod";
import { Gender } from "../../../generated/prisma/enums";
import { validateRequest } from "../../shared/validateRequest";
import { createDoctorZodSchema } from "./user.validation";

const router = Router();

router.post(
  "/create-doctor",
  validateRequest(createDoctorZodSchema),
  userController.createDoctor,
);
// router.get("/doctor/:id", userController.getDoctor);

export const userRoutes = router;
