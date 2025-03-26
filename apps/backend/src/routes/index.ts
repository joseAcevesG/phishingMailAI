import { Router } from "express";
import auth from "./auth";
const router = Router();

router.get("/", (_req, res) => {
	res.json({ name: "test monorepo" });
});

router.use("/auth", auth);

export default router;
