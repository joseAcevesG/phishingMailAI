import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import auth from "../middlewares/auth";
const router = Router();

router.post("/signup", AuthController.signUp.bind(AuthController));
router.post("/login", AuthController.login.bind(AuthController));
router.post(
	"/reset-password",
	AuthController.resetPassword.bind(AuthController),
);
router.post("/authenticate", AuthController.authenticate.bind(AuthController));
router.post("/logout", auth, AuthController.logout);
router.post("/logout-all", auth, AuthController.logoutAll);
router.post("/change-trial", auth, AuthController.changeTrial);
router.get("/status", AuthController.status);

export default router;
