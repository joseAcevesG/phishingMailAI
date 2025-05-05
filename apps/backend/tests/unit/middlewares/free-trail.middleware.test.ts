import type { NextFunction, Request, Response } from "express";
import {
	type Mock,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import openai from "../../../src/config/openai";
import freeTrialMiddleware from "../../../src/middlewares/free-trail";
import userModel from "../../../src/models/user.model";
import type { User } from "../../../src/types";
import { decrypt } from "../../../src/utils/encrypt-string";
import ResponseStatus from "../../../src/utils/response-codes";

// Mock dependencies to isolate middleware logic
vi.mock("../../../src/models/user.model", () => ({
	default: { updateOne: vi.fn() },
}));
vi.mock("../../../src/utils/encrypt-string", () => ({
	decrypt: vi.fn(),
}));
vi.mock("../../../src/config/openai", () => ({
	default: { changeApiKey: vi.fn() },
}));

vi.mock("../../../src/config/env.config", () => ({
	EnvConfig: () => ({ freeTrialLimit: 3, environment: "test" }),
}));

// Use a shared next function mock for all tests
const next: NextFunction = vi.fn();

// Test suite for freeTrial middleware
// Covers all major code paths for free trial logic, user API key handling, and error cases
describe("freeTrial middleware", () => {
	let req: Partial<Request & { user?: User }>;
	let res: Partial<Response> & { status: Mock; json: Mock };
	let userMock: User;
	let runUser: User;

	// Initialize a base user object for cloning in each test
	beforeAll(() => {
		userMock = {
			_id: "u1",
			freeTrial: true,
			usageFreeTrial: 0,
			email: "user@example.com",
			analysis: [],
		};
	});

	// Reset mocks and request/response objects before each test
	beforeEach(() => {
		req = {};
		runUser = structuredClone(userMock);
		res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
		(next as Mock).mockClear();
		vi.clearAllMocks();
	});

	// Test: User under free trial limit should be allowed and usage incremented
	it("should allow if under free trial limit and increment usage", async () => {
		req.user = runUser;
		req.user.usageFreeTrial = 2;
		(userModel.updateOne as Mock).mockResolvedValue({});
		freeTrialMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should increment usage and call next
		expect(userModel.updateOne).toHaveBeenCalledWith(
			{ _id: "u1" },
			{ usageFreeTrial: 3 },
		);
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	// Test: User exceeding free trial limit should be blocked
	it("should block if free trial limit exceeded", () => {
		req.user = runUser;
		req.user.usageFreeTrial = 3;
		freeTrialMiddleware(req as Request, res as Response, next);
		// Should return 403 Forbidden
		expect(res.status).toHaveBeenCalledWith(ResponseStatus.FORBIDDEN.code);
		expect(res.json).toHaveBeenCalledWith({
			message: "Free trial limit exceeded",
		});
		expect(next).not.toHaveBeenCalled();
	});

	// Test: Should return error if updateOne fails
	it("should return error if updateOne fails", async () => {
		req.user = runUser;
		req.user.usageFreeTrial = 2;
		(userModel.updateOne as Mock).mockRejectedValue(new Error("fail"));
		freeTrialMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should return 500 Internal Server Error
		expect(res.status).toHaveBeenCalledWith(
			ResponseStatus.INTERNAL_SERVER_ERROR.code,
		);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
		});
		expect(next).not.toHaveBeenCalled();
	});

	// Test: Block if user is not in free trial and has no API key
	it("should block if no api_key and not freeTrial", () => {
		req.user = runUser;
		req.user.freeTrial = false;
		freeTrialMiddleware(req as Request, res as Response, next);
		// Should return 403 Forbidden
		expect(res.status).toHaveBeenCalledWith(ResponseStatus.FORBIDDEN.code);
		expect(res.json).toHaveBeenCalledWith({
			message: "Free trial limit exceeded",
		});
		expect(next).not.toHaveBeenCalled();
	});

	// Test: User has API key, should decrypt and set for OpenAI, then call next
	it("should call decrypt and changeApiKey and next if api_key exists", async () => {
		req.user = runUser;
		req.user.freeTrial = false;
		req.user.api_key = "encryptedKey";
		(decrypt as Mock).mockResolvedValue("realKey");
		freeTrialMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should decrypt API key and update OpenAI config
		expect(decrypt).toHaveBeenCalledWith("encryptedKey");
		expect(openai.changeApiKey).toHaveBeenCalledWith("realKey");
		expect(next).toHaveBeenCalled();
	});

	// Test: Should return error if decrypt fails (user has api_key)
	it("should return error if decrypt fails", async () => {
		req.user = runUser;
		req.user.api_key = "encryptedKey";
		(decrypt as Mock).mockRejectedValue(new Error("fail"));
		freeTrialMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should return 500 Internal Server Error
		expect(res.status).toHaveBeenCalledWith(
			ResponseStatus.INTERNAL_SERVER_ERROR.code,
		);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
		});
		expect(next).not.toHaveBeenCalled();
	});

	// Test: Should return error if decrypt fails (user not in free trial, has api_key)
	it("should return error if decrypt fails (INTERNAL_SERVER_ERROR)", async () => {
		req.user = runUser;
		req.user.freeTrial = false;
		req.user.api_key = "encryptedKey";
		(decrypt as Mock).mockRejectedValue(new Error("fail"));
		freeTrialMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should return 500 Internal Server Error
		expect(res.status).toHaveBeenCalledWith(
			ResponseStatus.INTERNAL_SERVER_ERROR.code,
		);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
		});
	});
});
