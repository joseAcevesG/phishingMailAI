import { Router } from "express";
import AnalyzeMailController from "../controllers/analyze-mail.controller";
import auth from "../middlewares/auth";

const router = Router();

router.post("/validate", auth, AnalyzeMailController.validateMail);

export default router;
