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
import freeTrialMiddleware from "../../../src/middlewares/free-trail";
import userModel from "../../../src/models/user.model";
import type { User } from "../../../src/types";
import { decrypt } from "../../../src/utils/encrypt-string";
import ResponseStatus from "../../../src/utils/response-codes";
import openai from "../../../src/config/openai";

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
	EnvConfig: () => ({ freeTrialLimit: 3 }),
}));

const next: NextFunction = vi.fn();

describe("freeTrial middleware", () => {
	let req: Partial<Request & { user?: User }>;
	let res: Partial<Response> & { status: Mock; json: Mock };
	let userMock: User;
	let runUser: User;

	beforeAll(() => {
		userMock = {
			_id: "u1",
			freeTrial: true,
			usageFreeTrial: 0,
			email: "user@example.com",
			analysis: [],
		};
	});

	beforeEach(() => {
		req = {};
		runUser = structuredClone(userMock);
		res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
		(next as Mock).mockClear();
		vi.clearAllMocks();
	});

	it("should allow if under free trial limit and increment usage", async () => {
		req.user = runUser;
		req.user.usageFreeTrial = 2;
		(userModel.updateOne as Mock).mockResolvedValue({});
		freeTrialMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		expect(userModel.updateOne).toHaveBeenCalledWith(
			{ _id: "u1" },
			{ usageFreeTrial: 3 },
		);
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	it("should block if free trial limit exceeded", () => {
		req.user = runUser;
		req.user.usageFreeTrial = 3;
		freeTrialMiddleware(req as Request, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(ResponseStatus.FORBIDDEN.code);
		expect(res.json).toHaveBeenCalledWith({
			message: "Free trial limit exceeded",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("should return error if updateOne fails", async () => {
		req.user = runUser;
		req.user.usageFreeTrial = 2;
		(userModel.updateOne as Mock).mockRejectedValue(new Error("fail"));
		freeTrialMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		expect(res.status).toHaveBeenCalledWith(
			ResponseStatus.INTERNAL_SERVER_ERROR.code,
		);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("should block if no api_key and not freeTrial", () => {
		req.user = runUser;
		req.user.freeTrial = false;
		freeTrialMiddleware(req as Request, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(ResponseStatus.FORBIDDEN.code);
		expect(res.json).toHaveBeenCalledWith({
			message: "Free trial limit exceeded",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("should call decrypt and changeApiKey and next if api_key exists", async () => {
		req.user = runUser;
		req.user.freeTrial = false;
		req.user.api_key = "encryptedKey";
		(decrypt as Mock).mockResolvedValue("realKey");
		freeTrialMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		expect(decrypt).toHaveBeenCalledWith("encryptedKey");
		expect(openai.changeApiKey).toHaveBeenCalledWith("realKey");
		expect(next).toHaveBeenCalled();
	});

	it("should return error if decrypt fails", async () => {
		req.user = runUser;
		req.user.api_key = "encryptedKey";
		(decrypt as Mock).mockRejectedValue(new Error("fail"));
		freeTrialMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		expect(res.status).toHaveBeenCalledWith(
			ResponseStatus.INTERNAL_SERVER_ERROR.code,
		);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
		});
		expect(next).not.toHaveBeenCalled();
	});
});
