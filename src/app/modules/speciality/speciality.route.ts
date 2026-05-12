import { NextFunction, Request, Response, Router } from "express";
import { specialityController } from "./speciality.controller";
import { tokenUtils } from "../../utils/token";
import { cookieUtils } from "../../utils/cookie";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.post("/", specialityController.createSpeciality);
router.get(
  "/",
  checkAuth(Role.ADMIN),
  specialityController.getAllSpecialities,
);
router.delete("/:id", specialityController.deleteSpeciality);

export const SpecialityRoutes = router;
