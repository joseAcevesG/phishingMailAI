import { readFile } from "node:fs/promises";
import type { Response } from "express";
import { simpleParser } from "mailparser";
import { Types } from "mongoose";
import { z } from "zod";
import openaiConfig from "../config/openai";
import userModel from "../models/user.model";
import type { Analysis, Mail, OpenAIResponse, RequestUser } from "../types";
import StatusCodes from "../types/response-codes";
import { BadRequestError } from "../utils/errors";

const MailSchema = z.object({
	subject: z.string(),
	from: z.string(),
	to: z.string(),
	text: z.string(),
	html: z.string(),
});

class AnalyzeMailController {
	create(req: RequestUser, res: Response): void {
		if (!req.file) {
			res
				.status(StatusCodes.BAD_REQUEST.code)
				.send(StatusCodes.BAD_REQUEST.message);
			return;
		}

		let emailData: Mail;

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
				const emailRawData = {
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

				// Validate emailData with Zod
				const result = MailSchema.safeParse(emailRawData);
				if (!result.success) {
					throw new BadRequestError(
						`Invalid email data: ${JSON.stringify(result.error.issues)}`,
					);
				}
				emailData = result.data;

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
				) as OpenAIResponse;
				const analysisData: Analysis = {
					_id: new Types.ObjectId().toString(),
					subject: emailData.subject,
					from: emailData.from,
					to: emailData.to,
					phishingProbability: analysis.phishingProbability,
					reasons: analysis.reasons,
					redFlags: analysis.redFlags,
				};

				// Save analysis to user's history
				req.user?.analysis.push(analysisData);
				return userModel.findOneAndUpdate(
					{ _id: req.user?._id },
					{ $set: { analysis: req.user?.analysis } },
					{ new: true },
				);
			})
			.then((user) => {
				if (!user) {
					throw new BadRequestError("User not found");
				}
				res.json(user.analysis);
			})
			.catch((error) => {
				if (error instanceof BadRequestError) {
					res.status(StatusCodes.BAD_REQUEST.code).send(error.message);
					return;
				}

				// Check for OpenAI API authentication error
				if (
					error.response?.status === 401 ||
					error.message?.includes("API key")
				) {
					res
						.status(StatusCodes.BAD_REQUEST.code)
						.send("Invalid OpenAI API key provided");
					return;
				}

				console.error("Error analyzing email:", error);

				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
			});
	}

	read(req: RequestUser, res: Response): void {
		if (!req.user) {
			res
				.status(StatusCodes.UNAUTHORIZED.code)
				.send(StatusCodes.UNAUTHORIZED.message);
			return;
		}
		res.json(
			req.user.analysis.map((analysis) => ({
				_id: analysis._id,
				subject: analysis.subject,
				from: analysis.from,
				to: analysis.to,
			})),
		);
	}
}

export default new AnalyzeMailController();
