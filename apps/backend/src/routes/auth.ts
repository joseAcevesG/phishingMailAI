import { Router } from "express";
import AuthController from "../controllers/auth.controller";
const router = Router();

router.post("/login", AuthController.login);
router.get("/authenticate", AuthController.authenticate);
router.post("/logout", AuthController.logout);

export default router;
