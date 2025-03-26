import type { Response } from "express";
import type { RequestUser } from "../types";

class AnalyzeMailController {
	validateMail(req: RequestUser, res: Response) {
		console.log("Uploaded file:", req.file?.originalname);
		res.send("validateMail");
	}
}

export default new AnalyzeMailController();
