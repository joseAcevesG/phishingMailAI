import { Router } from "express";
import { upload } from "../config/multer";
import AnalyzeMailController from "../controllers/analyze-mail.controller";
import auth from "../middlewares/auth";

const router = Router();

router.post(
	"/validate",
	auth,
	upload.single("emlFile"),
	AnalyzeMailController.validateMail,
);

export default router;
