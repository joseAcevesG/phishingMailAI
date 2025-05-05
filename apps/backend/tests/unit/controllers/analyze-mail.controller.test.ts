// Unit tests for AnalyzeMailController
// Uses Vitest and mocks dependencies to test all controller logic and error handling
import { readFile } from "node:fs/promises";
import type { Request, Response } from "express";
import type { Express } from "express";
import { simpleParser } from "mailparser";
import { Types } from "mongoose";
import {
	type Mock,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import openaiConfig from "../../../src/config/openai";
import AnalyzeMailController from "../../../src/controllers/analyze-mail.controller";
import userModel from "../../../src/models/user.model";
import type { User } from "../../../src/types";
import StatusCodes from "../../../src/utils/response-codes";

// Mock node:fs/promises to control file reading
vi.mock("node:fs/promises", () => ({ readFile: vi.fn() }));
// Mock mailparser to control email parsing
vi.mock("mailparser", () => ({ simpleParser: vi.fn() }));
// Mock OpenAI config to control AI responses
vi.mock("../../../src/config/openai", () => ({
	default: {
		SYSTEM_PROMPT: "test-system-prompt",
		openai: { chat: { completions: { create: vi.fn() } } },
	},
}));
// Mock user model to control DB operations
vi.mock("../../../src/models/user.model", () => ({
	default: { findByIdAndUpdate: vi.fn() },
}));

// Always return the same ObjectId for deterministic tests
const testId = "test-id";
vi.spyOn(Types, "ObjectId").mockImplementation(
	() => ({ toString: () => testId }) as Types.ObjectId,
);

// Define test types for request and response with optional fields
// Allows us to inject mocks and simulate Express behavior
type TestRequest = Request & {
	file?: Express.Multer.File;
	user?: User;
	params?: { id: string };
};
type TestResponse = Response & {
	status: Mock;
	json: Mock;
};

// Main test suite for AnalyzeMailController
// Covers create, read, getById, and delete methods
describe("AnalyzeMailController", () => {
	let req: TestRequest;
	let res: TestResponse;
	let userMock: User;
	let id1: string;
	let runUser: User;

	// Set up reusable user and analysis data before all tests
	beforeAll(() => {
		id1 = "aaaaaaaaaaaaaaaaaaaaaaaa";
		userMock = {
			_id: "u1",
			email: "user@example.com",
			freeTrial: true,
			usageFreeTrial: 0,
			analysis: [
				{
					_id: id1,
					subject: "s",
					from: "f",
					to: "t",
					phishingProbability: 0,
					reasons: [],
					redFlags: [],
				},
			],
		};
	});

	// Reset mocks and clone user before each test
	beforeEach(() => {
		req = {} as TestRequest;
		runUser = structuredClone(userMock);
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as TestResponse;
		vi.clearAllMocks();
	});

	// Tests for create method
	describe("create", () => {
		// Should return 400 if no file is uploaded
		it("should return 400 if no file", () => {
			AnalyzeMailController.create(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.BAD_REQUEST.message,
			});
		});

		// Should return 400 if email content is empty
		it("should return 400 if email content is empty", async () => {
			req.file = {
				fieldname: "file",
				originalname: "test.eml",
				encoding: "7bit",
				mimetype: "message/rfc822",
				size: 123,
				destination: "/tmp",
				filename: "test.eml",
				path: "path",
				buffer: Buffer.from(" "),
			} as Express.Multer.File;
			(readFile as Mock).mockResolvedValue(" ");
			AnalyzeMailController.create(req, res);
			await new Promise((r) => setImmediate(r));
			expect(readFile).toHaveBeenCalledWith("path", "utf-8");
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Email content cannot be empty",
			});
		});

		// Should return 400 if parsed email has no html
		it("should return 400 if parsed email has no html", async () => {
			req.file = {
				fieldname: "file",
				originalname: "test.eml",
				encoding: "7bit",
				mimetype: "message/rfc822",
				size: 123,
				destination: "/tmp",
				filename: "test.eml",
				path: "path",
				buffer: Buffer.from(" "),
			} as Express.Multer.File;
			(readFile as Mock).mockResolvedValue("raw email");
			(simpleParser as Mock).mockResolvedValue({
				html: undefined,
			});
			AnalyzeMailController.create(req, res);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Email content cannot be empty",
			});
		});

		// Should return 400 if email data is invalid per schema
		it("should return 400 if email data is invalid per schema", async () => {
			req.file = {
				fieldname: "file",
				originalname: "test.eml",
				encoding: "7bit",
				mimetype: "message/rfc822",
				size: 123,
				destination: "/tmp",
				filename: "test.eml",
				path: "path",
				buffer: Buffer.from(" "),
			} as Express.Multer.File;
			(readFile as Mock).mockResolvedValue("raw email");
			(simpleParser as Mock).mockResolvedValue({
				html: "<p>hi</p>",
				subject: undefined,
				from: { text: "from" },
				to: { text: "to" },
				text: "text",
			});
			AnalyzeMailController.create(req, res);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: expect.stringContaining("Invalid email data"),
			});
		});

		// Should return analysis on success
		it("should return analysis on success", async () => {
			req.file = {
				fieldname: "file",
				originalname: "test.eml",
				encoding: "7bit",
				mimetype: "message/rfc822",
				size: 123,
				destination: "/tmp",
				filename: "test.eml",
				path: "path",
				buffer: Buffer.from(" "),
			} as Express.Multer.File;
			req.user = runUser;
			(readFile as Mock).mockResolvedValue("raw email");
			(simpleParser as Mock).mockResolvedValue({
				html: "<p>hi</p>",
				subject: "subj",
				from: { text: "from" },
				to: { text: "to" },
				text: "text",
			});
			const aiContent = JSON.stringify({
				phishingProbability: 0.8,
				reasons: ["r"],
				redFlags: ["f"],
			});
			(openaiConfig.openai.chat.completions.create as Mock).mockResolvedValue({
				choices: [{ message: { content: aiContent } }],
			});
			const updated = {
				analysis: [
					{
						_id: testId,
						subject: "subj",
						from: "from",
						to: "to",
						phishingProbability: 0.8,
						reasons: ["r"],
						redFlags: ["f"],
					},
				],
			};
			(userModel.findByIdAndUpdate as Mock).mockResolvedValue(updated);

			AnalyzeMailController.create(req, res);
			await new Promise((r) => setImmediate(r));
			expect(res.json).toHaveBeenCalledWith(updated.analysis[0]);
		});

		// Should return 400 for invalid API key error
		it("should return 400 for invalid API key error", async () => {
			req.file = {
				fieldname: "file",
				originalname: "test.eml",
				encoding: "7bit",
				mimetype: "message/rfc822",
				size: 123,
				destination: "/tmp",
				filename: "test.eml",
				path: "path",
				buffer: Buffer.from(" "),
			} as Express.Multer.File;
			(readFile as Mock).mockResolvedValue("raw");
			(simpleParser as Mock).mockResolvedValue({
				html: "<p>1</p>",
				subject: "s",
				from: { text: "f" },
				to: { text: "t" },
				text: "t",
			});
			(openaiConfig.openai.chat.completions.create as Mock).mockRejectedValue({
				response: { status: 401 },
			});

			AnalyzeMailController.create(req, res);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Invalid OpenAI API key provided",
			});
		});

		// Should return 500 for other errors
		it("should return 500 for other errors", async () => {
			req.file = {
				fieldname: "file",
				originalname: "test.eml",
				encoding: "7bit",
				mimetype: "message/rfc822",
				size: 123,
				destination: "/tmp",
				filename: "test.eml",
				path: "path",
				buffer: Buffer.from(" "),
			} as Express.Multer.File;
			(readFile as Mock).mockRejectedValue(new Error("foo"));
			AnalyzeMailController.create(req, res);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(
				StatusCodes.INTERNAL_SERVER_ERROR.code,
			);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.INTERNAL_SERVER_ERROR.message,
			});
		});
	});

	// Tests for read method
	describe("read", () => {
		// Should return 401 if no user is present
		it("should return 401 if no user", () => {
			AnalyzeMailController.read(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		// Should return analysis list for a valid user
		it("should return analysis list", () => {
			req.user = runUser;
			AnalyzeMailController.read(req, res);
			expect(res.json).toHaveBeenCalledWith([
				{ _id: id1, subject: "s", from: "f", to: "t" },
			]);
		});
	});

	// Tests for getById method
	describe("getById", () => {
		// Should return 401 if no user
		it("should return 401 if no user", () => {
			AnalyzeMailController.getById(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		// Should return 400 if id param is invalid
		it("should return 400 if invalid id", () => {
			req.user = runUser;
			req.params = { id: "bad" };
			AnalyzeMailController.getById(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		// Should return 404 if analysis is not found
		it("should return 404 if analysis not found", () => {
			req.user = runUser;
			req.params = { id: "bbbbbbbbbbbbbbbbbbbbbbbb" };
			AnalyzeMailController.getById(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND.code);
			expect(res.json).toHaveBeenCalledWith({ message: "Analysis not found" });
		});

		// Should return analysis if found
		it("should return analysis if found", () => {
			const analysis = {
				_id: id1,
				subject: "s",
				from: "f",
				to: "t",
				phishingProbability: 0,
				reasons: [],
				redFlags: [],
			};
			req.user = runUser;
			req.params = { id: id1 };
			AnalyzeMailController.getById(req, res);
			expect(res.json).toHaveBeenCalledWith(analysis);
		});
	});

	// Tests for delete method
	describe("delete", () => {
		// Should return 401 if no user
		it("should return 401 if no user", () => {
			AnalyzeMailController.delete(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		// Should return 400 if id param is invalid
		it("should return 400 if invalid id", () => {
			req.user = runUser;
			req.params = { id: "bad" };
			AnalyzeMailController.delete(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		// Should return list if analysis not found
		it("should return list if analysis not found", () => {
			req.user = runUser;
			req.params = { id: "bbbbbbbbbbbbbbbbbbbbbbbb" };
			AnalyzeMailController.delete(req, res);
			expect(res.json).toHaveBeenCalledWith([
				{ _id: id1, subject: "s", from: "f", to: "t" },
			]);
		});

		// Should delete and return list on success
		it("should delete and return list on success", async () => {
			req.user = runUser;
			req.params = { id: id1 };
			const analysis = [{ _id: id1, subject: "s", from: "f", to: "t" }];
			(userModel.findByIdAndUpdate as Mock).mockResolvedValue({ analysis });
			AnalyzeMailController.delete(req, res);
			await new Promise((r) => setImmediate(r));
			expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
				"u1",
				{ $set: { analysis: [] } },
				{ new: true },
			);
			expect(res.json).toHaveBeenCalledWith(analysis);
		});

		// Should return 500 on db error
		it("should return 500 on db error", async () => {
			req.user = runUser;
			req.params = { id: id1 };
			(userModel.findByIdAndUpdate as Mock).mockRejectedValue(
				new Error("db error"),
			);
			AnalyzeMailController.delete(req, res);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(
				StatusCodes.INTERNAL_SERVER_ERROR.code,
			);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.INTERNAL_SERVER_ERROR.message,
			});
		});
	});
});
