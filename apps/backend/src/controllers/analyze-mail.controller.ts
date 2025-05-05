import { readFile } from "node:fs/promises";
import type { Request, Response } from "express";
import { simpleParser } from "mailparser";
import { Types } from "mongoose";
import type { Analysis } from "shared";
import { EnvConfig } from "../config/env.config";
import openaiConfig from "../config/openai";
import userModel from "../models/user.model";
import IdSchema from "../schemas/id.schema";
import MailSchema from "../schemas/mail.schema";
import type { Mail, OpenAIResponse } from "../types";
import { BadRequestError } from "../utils/errors";
import StatusCodes from "../utils/response-codes";

/**
 * Handles HTTP requests related to email analysis.
 *
 * @class AnalyzeMailController
 *
 */
class AnalyzeMailController {
	/**
	 * Analyze an uploaded email file for phishing attempts using GPT-4o-mini.
	 *
	 * @param req Request object
	 * @param res Response object
	 *
	 * Reads the email content from the file on disk, extracts relevant information,
	 * validates it with Zod, and analyzes it with GPT-4o-mini. The analysis result is
	 * saved to the user's history and returned as JSON.
	 *
	 * If the file is not present in the request, it returns a 400 Bad Request error.
	 * If the email content is empty or invalid, it returns a 400 Bad Request error.
	 * If the user is not authenticated, it returns a 401 Unauthorized error.
	 * If there is an error with the OpenAI API, it returns a 500 Internal Server Error.
	 * If there is an unexpected error, it returns a 500 Internal Server Error.
	 *
	 */
	create(req: Request, res: Response): void {
		// Check if the file is present in the request
		if (!req.file) {
			res
				.status(StatusCodes.BAD_REQUEST.code)
				.json({ message: StatusCodes.BAD_REQUEST.message });
			return;
		}

		let emailData: Mail;
		let mailId: string;

		// Support both disk and memory storage
		let getEmailContent: Promise<string>;
		if (req.file.path) {
			// Read the email content from the file on disk
			getEmailContent = readFile(req.file.path, "utf-8");
		} else if (req.file.buffer) {
			// Read the email content from the file buffer in memory
			getEmailContent = Promise.resolve(req.file.buffer.toString("utf-8"));
		} else {
			res
				.status(StatusCodes.BAD_REQUEST.code)
				.json({ message: "Email file missing or unreadable" });
			return;
		}

		getEmailContent
			.then((emailContent) => {
				// Check if the email content is not empty
				if (!emailContent || emailContent.trim() === "") {
					throw new BadRequestError("Email content cannot be empty");
				}
				return simpleParser(emailContent);
			})
			.then((parsedEmail) => {
				// Check if the email content is valid
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

				mailId = new Types.ObjectId().toString();
				const analysisData: Analysis = {
					_id: mailId,
					subject: emailData.subject,
					from: emailData.from,
					to: emailData.to,
					phishingProbability: analysis.phishingProbability,
					reasons: analysis.reasons,
					redFlags: analysis.redFlags,
				};

				// Save analysis to user's history
				req.user?.analysis.push(analysisData);
				return userModel.findByIdAndUpdate(
					req.user?._id,
					{ $set: { analysis: req.user?.analysis } },
					{ new: true },
				);
			})
			.then((user) => {
				if (!user) {
					throw new BadRequestError("User not found");
				}
				res.json(user.analysis.find((mail) => mail._id === mailId));
			})
			.catch((error) => {
				if (error instanceof BadRequestError) {
					res.status(StatusCodes.BAD_REQUEST.code).json({
						message: error.message,
					});
					return;
				}

				// Check for OpenAI API authentication error
				if (
					error.response?.status === 401 ||
					error.message?.includes("API key")
				) {
					res
						.status(StatusCodes.BAD_REQUEST.code)
						.json({ message: "Invalid OpenAI API key provided" });
					return;
				}
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.json({ message: StatusCodes.INTERNAL_SERVER_ERROR.message });

				if (EnvConfig().environment !== "test")
					console.error("Error analyzing email:", error);
			});
	}

	/**
	 * Get all analyzed emails for the authenticated user
	 *
	 * @param req Request object
	 * @param res Response object
	 *
	 * If the user is not authenticated, it returns a 401 Unauthorized error.
	 */
	read(req: Request, res: Response): void {
		// Check if the user is authenticated
		if (!req.user) {
			res
				.status(StatusCodes.UNAUTHORIZED.code)
				.json({ message: StatusCodes.UNAUTHORIZED.message });
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

	/**
	 * Get a specific analyzed email by ID
	 *
	 * @param req Request object
	 * @param res Response object
	 *
	 * If the user is not authenticated, it returns a 401 Unauthorized error.
	 * If the ID is not valid, it returns a 400 Bad Request error.
	 * If the analysis is not found, it returns a 404 Not Found error.
	 */
	getById(req: Request, res: Response): void {
		// Check if the user is authenticated
		if (!req.user) {
			res
				.status(StatusCodes.UNAUTHORIZED.code)
				.json({ message: StatusCodes.UNAUTHORIZED.message });
			return;
		}
		const parseResult = IdSchema.safeParse(req.params);
		if (!parseResult.success) {
			res
				.status(StatusCodes.BAD_REQUEST.code)
				.json({ message: parseResult.error.errors[0].message });
			return;
		}
		const { id } = parseResult.data;
		const analysis = req.user.analysis.find((mail) => mail._id === id);
		if (!analysis) {
			res
				.status(StatusCodes.NOT_FOUND.code)
				.json({ message: "Analysis not found" });
			return;
		}
		res.json(analysis);
	}

	/**
	 * Delete a specific analyzed email by ID
	 *
	 * @param req Request object
	 * @param res Response object
	 *
	 * If the user is not authenticated, it returns a 401 Unauthorized error.
	 * If the ID is not valid, it returns a 400 Bad Request error.
	 * If the analysis is not found, it returns a 404 Not Found error.
	 */
	delete(req: Request, res: Response): void {
		// Check if the user is authenticated
		if (!req.user) {
			res
				.status(StatusCodes.UNAUTHORIZED.code)
				.json({ message: StatusCodes.UNAUTHORIZED.message });
			return;
		}
		const parseResult = IdSchema.safeParse(req.params);
		if (!parseResult.success) {
			res
				.status(StatusCodes.BAD_REQUEST.code)
				.json({ message: parseResult.error.errors[0].message });
			return;
		}
		const { id } = parseResult.data;
		const analysis = req.user.analysis.find((mail) => mail._id === id);
		if (!analysis) {
			res.json(
				req.user.analysis.map((mail) => ({
					_id: mail._id,
					subject: mail.subject,
					from: mail.from,
					to: mail.to,
				})),
			);
			return;
		}
		req.user.analysis = req.user.analysis.filter((mail) => mail._id !== id);
		userModel
			.findByIdAndUpdate(
				req.user._id,
				{ $set: { analysis: req.user.analysis } },
				{ new: true },
			)
			.then((user) => {
				if (!user) {
					throw new BadRequestError("User not found");
				}
				res.json(
					user.analysis.map((mail) => ({
						_id: mail._id,
						subject: mail.subject,
						from: mail.from,
						to: mail.to,
					})),
				);
			})
			.catch((error) => {
				if (error instanceof BadRequestError) {
					res.status(StatusCodes.BAD_REQUEST.code).json({
						message: error.message,
					});
					return;
				}
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.json({ message: StatusCodes.INTERNAL_SERVER_ERROR.message });

				if (EnvConfig().environment !== "test")
					console.error("Error deleting analysis:", error);
			});
	}
}

export default new AnalyzeMailController();
