import type { Request, Response } from "express";

class AnalyzeMailController {
	validateMail(_req: Request, res: Response) {
		res.send("validateMail");
	}
}

export default new AnalyzeMailController();
