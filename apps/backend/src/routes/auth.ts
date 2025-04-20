import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import auth from "../middlewares/auth";
const router = Router();

router.post("/login", AuthController.login);
router.get("/authenticate", AuthController.authenticate);
router.post("/logout", auth, AuthController.logout);
router.post("/logoutAll", auth, AuthController.logoutAll);
router.post("/changeTrial", auth, AuthController.changeTrial);
router.get("/status", AuthController.status);

export default router;
