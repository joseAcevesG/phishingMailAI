import { Router } from "express";
import analyzeMail from "./analyze-mail";
import auth from "./auth";

const router = Router();

router.get("/", (_req, res) => {
	res.json({ name: "test monorepo" });
});

router.use("/auth", auth);
router.use("/analyze-mail", analyzeMail);

export default router;
