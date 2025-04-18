import { Router } from "express";
import { upload } from "../config/multer";
import AnalyzeMailController from "../controllers/analyze-mail.controller";
import freeTrail from "../middlewares/free-trail";

const router = Router();

router.post(
	"/validate",
	freeTrail,
	upload.single("emlFile"),
	AnalyzeMailController.create,
);

router.get("/", AnalyzeMailController.read);
router.get("/:id", AnalyzeMailController.getById);
router.delete("/:id", AnalyzeMailController.delete);

export default router;
