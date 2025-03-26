import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import multer from "multer";

// Ensure uploads directory exists
export const uploadsDir = path.join(__dirname, "../../uploads");
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

export const upload = multer({
	storage,
	fileFilter: (_req, file, cb) => {
		if (
			file.mimetype === "message/rfc822" ||
			file.originalname.endsWith(".eml")
		) {
			cb(null, true);
		} else {
			cb(new Error("Only .eml files are allowed"));
		}
	},
});
