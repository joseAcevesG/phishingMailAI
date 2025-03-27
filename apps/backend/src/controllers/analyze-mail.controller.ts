import { readFile } from "node:fs/promises";
import type { Response } from "express";
import { simpleParser } from "mailparser";
import openaiConfig from "../config/openai";
import type { RequestUser } from "../types";
import StatusCodes from "../types/response-codes";
import { BadRequestError } from "../utils/errors";

class AnalyzeMailController {
	validateMail(req: RequestUser, res: Response): void {
		if (!req.file) {
			res
				.status(StatusCodes.BAD_REQUEST.code)
				.send(StatusCodes.BAD_REQUEST.message);
			return;
		}

		// Parse the email file
		readFile(req.file.path, "utf-8")
			.then((emailContent) => {
				if (!emailContent || emailContent.trim() === "") {
					throw new BadRequestError("Email content cannot be empty");
				}
				return simpleParser(emailContent);
			})
			.then((parsedEmail) => {
				if (!parsedEmail?.html) {
					throw new BadRequestError("Email content cannot be empty");
				}
				// Extract relevant email information
				const emailData = {
					subject: parsedEmail.subject,
					from: Array.isArray(parsedEmail.from)
						? parsedEmail.from[0]?.text
						: parsedEmail.from?.text,
					to: Array.isArray(parsedEmail.to)
						? parsedEmail.to[0]?.text
						: parsedEmail.to?.text,
					text: parsedEmail.text,
					html: parsedEmail.html,
				};

				// Analyze with GPT-4o-mini
				return openaiConfig.openai.chat.completions.create({
					model: "gpt-4o-mini",
					messages: [
						{ role: "system", content: openaiConfig.SYSTEM_PROMPT },
						{
							role: "user",
							content: `Analyze this email for phishing attempts:\n${JSON.stringify(emailData, null, 2)}`,
						},
					],
					response_format: { type: "json_object" },
				});
			})
			.then((completion) => {
				const analysis = JSON.parse(
					completion?.choices[0].message?.content || "",
				);
				res.json(analysis);
			})
			.catch((error) => {
				if (error instanceof BadRequestError) {
					res.status(StatusCodes.BAD_REQUEST.code).send(error.message);
					return;
				}
				console.error("Error analyzing email:", error);

				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
			});
	}
}

export default new AnalyzeMailController();
