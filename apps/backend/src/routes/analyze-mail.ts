import { Router } from "express";
import { upload } from "../config/multer";
import AnalyzeMailController from "../controllers/analyze-mail.controller";
import auth from "../middlewares/auth";
import freeTrail from "../middlewares/free-trail";

const router = Router();

router.post(
	"/validate",
	auth,
	freeTrail,
	upload.single("emlFile"),
	AnalyzeMailController.create,
);

router.get("/history", auth, AnalyzeMailController.read);

export default router;
