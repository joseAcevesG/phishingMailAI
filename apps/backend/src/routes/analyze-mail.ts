import { Router } from "express";
import multer from "multer";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import AnalyzeMailController from "../controllers/analyze-mail.controller";
import auth from "../middlewares/auth";

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for .eml files
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "message/rfc822" || file.originalname.endsWith(".eml")) {
      cb(null, true);
    } else {
      cb(new Error("Only .eml files are allowed"));
    }
  },
});

router.post("/validate", auth, upload.single("emlFile"), AnalyzeMailController.validateMail);

export default router;
