import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import auth from "../middlewares/auth";
const router = Router();

router.post("/login", AuthController.login);
router.get("/authenticate", AuthController.authenticate);
router.post("/logout", AuthController.logout);
router.post("/changeTrial", auth, AuthController.changeTrial);

export default router;
