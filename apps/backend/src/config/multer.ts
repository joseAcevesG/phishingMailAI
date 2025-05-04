import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import multer from "multer";

// The uploads directory is used to store uploaded .eml files
export const uploadsDir = path.join(__dirname, "../../uploads");
if (!existsSync(uploadsDir)) {
	mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer disk storage configuration.
 *
 * The `destination` callback sets the destination directory for uploaded files.
 * The `filename` callback sets the filename for the uploaded file, in the
 * format `<timestamp>-<original filename>`.
 */
const storage = multer.diskStorage({
	// The destination directory for uploaded files
	destination: (_req, _file, cb) => {
		cb(null, uploadsDir);
	},
	// The filename is in the format <timestamp>-<original filename>
	filename: (_req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

/**
 * Multer middleware for uploading .eml files.
 *
 * The `storage` option configures the destination directory for uploaded files.
 * The `fileFilter` option checks if the uploaded file is an .eml file.
 *
 * @returns {multer.Multer} The configured multer middleware.
 */
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
