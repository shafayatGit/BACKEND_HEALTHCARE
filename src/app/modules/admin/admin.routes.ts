import { Router } from "express";
import { adminControllers } from "./admin.controller";

const router = Router();

router.get("/", adminControllers.getAllAdmin);

export const adminRoutes = router;
