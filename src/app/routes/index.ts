import { Router } from "express";
import { SpecialityRoutes } from "../modules/speciality/speciality.route";
import { AuthRoutes } from "../modules/auth/auth.routes";

const router = Router();

router.use("/specialities", SpecialityRoutes);
router.use("/auth", AuthRoutes);

export const IndexRoutes = router;
