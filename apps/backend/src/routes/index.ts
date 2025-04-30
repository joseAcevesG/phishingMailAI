import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import analyzeMail from "./analyze-mail";
import authRouter from "./auth";
const router = Router();

router.get("/", (_req, res) => {
	res.json({ name: "PhishingMailAI" });
});

router.use("/auth", authRouter);
router.use("/analyze-mail", authMiddleware, analyzeMail);

export default router;
