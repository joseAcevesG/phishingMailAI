import { readFile } from "node:fs/promises";
import type { Request, Response } from "express";
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
vi.mock("node:fs/promises", () => ({ readFile: vi.fn() }));
vi.mock("mailparser", () => ({ simpleParser: vi.fn() }));
vi.mock("../../../src/config/openai", () => ({
	default: {
		SYSTEM_PROMPT: "test-system-prompt",
		openai: { chat: { completions: { create: vi.fn() } } },
	},
}));
vi.mock("../../../src/models/user.model", () => ({
	default: { findOneAndUpdate: vi.fn() },
}));

const testId = "test-id";
vi.spyOn(Types, "ObjectId").mockImplementation(
	() => ({ toString: () => testId }) as Types.ObjectId,
);

/** Test-specific request & response types */
type TestRequest = Request & {
	file?: { path: string };
	user?: User;
	params?: { id: string };
};
// Response mock stub with vitest Mock
type TestResponse = Response & {
	status: Mock;
	json: Mock;
};

describe("AnalyzeMailController", () => {
	let req: TestRequest;
	let res: TestResponse;
	let userMock: User;
	let id1: string;
	let runUser: User;

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

	beforeEach(() => {
		req = {} as TestRequest;
		runUser = structuredClone(userMock);
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as TestResponse;
		vi.clearAllMocks();
	});

	describe("create", () => {
		it("should return 400 if no file", () => {
			AnalyzeMailController.create(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.BAD_REQUEST.message,
			});
		});

		it("should return 400 if email content is empty", async () => {
			req.file = { path: "path" };
			(readFile as Mock).mockResolvedValue(" ");
			AnalyzeMailController.create(req, res);
			await new Promise((r) => setImmediate(r));
			expect(readFile).toHaveBeenCalledWith("path", "utf-8");
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Email content cannot be empty",
			});
		});

		it("should return analysis on success", async () => {
			req.file = { path: "path" };
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
			(userModel.findOneAndUpdate as Mock).mockResolvedValue(updated);

			AnalyzeMailController.create(req, res);
			await new Promise((r) => setImmediate(r));
			expect(res.json).toHaveBeenCalledWith(updated.analysis[0]);
		});

		it("should return 400 for invalid API key error", async () => {
			req.file = { path: "path" };
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

		it("should return 500 for other errors", async () => {
			req.file = { path: "p" };
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

	describe("read", () => {
		it("should return 401 if no user", () => {
			AnalyzeMailController.read(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		it("should return analysis list", () => {
			req.user = runUser;
			AnalyzeMailController.read(req, res);
			expect(res.json).toHaveBeenCalledWith([
				{ _id: id1, subject: "s", from: "f", to: "t" },
			]);
		});
	});

	describe("getById", () => {
		it("should return 401 if no user", () => {
			AnalyzeMailController.getById(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		it("should return 400 if invalid id", () => {
			req.user = runUser;
			req.params = { id: "bad" };
			AnalyzeMailController.getById(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		it("should return 404 if analysis not found", () => {
			req.user = runUser;
			req.params = { id: "bbbbbbbbbbbbbbbbbbbbbbbb" };
			AnalyzeMailController.getById(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND.code);
			expect(res.json).toHaveBeenCalledWith({ message: "Analysis not found" });
		});

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

	describe("delete", () => {
		it("should return 401 if no user", () => {
			AnalyzeMailController.delete(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		it("should return 400 if invalid id", () => {
			req.user = runUser;
			req.params = { id: "bad" };
			AnalyzeMailController.delete(req, res);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		it("should return list if analysis not found", () => {
			req.user = runUser;
			req.params = { id: "bbbbbbbbbbbbbbbbbbbbbbbb" };
			AnalyzeMailController.delete(req, res);
			expect(res.json).toHaveBeenCalledWith([
				{ _id: id1, subject: "s", from: "f", to: "t" },
			]);
		});

		it("should delete and return list on success", async () => {
			req.user = runUser;
			req.params = { id: id1 };
			(userModel.findOneAndUpdate as Mock).mockResolvedValue({ analysis: [] });
			AnalyzeMailController.delete(req, res);
			await new Promise((r) => setImmediate(r));
			expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: "u1" },
				{ $set: { analysis: [] } },
				{ new: true },
			);
			expect(res.json).toHaveBeenCalledWith([]);
		});

		it("should return 500 on db error", async () => {
			req.user = runUser;
			req.params = { id: id1 };
			(userModel.findOneAndUpdate as Mock).mockRejectedValue(
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
