import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";
import User from "../../../src/models/user.model";
import { encrypt } from "../../../src/utils/encrypt-string";

vi.mock("../../../src/middleware/auth", () => ({
	__esModule: true,
	default: (_req, _res, next) => {
		if (globalThis.shouldAuthenticate) {
			_req.user = { _id: "user123", email: "user@example.com" };
			next();
		} else {
			const err = new Error("Unauthorized");
			// @ts-ignore
			err.status = 401;
			next(err);
		}
	},
}));

vi.mock("../../../src/utils/encrypt-string", () => ({
	encrypt: vi.fn().mockResolvedValue("encryptedApiKeyValue"),
}));

vi.mock("../../../src/models/user.model", () => ({
	__esModule: true,
	default: {
		findOneAndUpdate: vi.fn(),
		findById: vi.fn(),
		findOne: vi.fn(),
		create: vi.fn(),
	},
}));

vi.mock("../../../src/models/refresh-token.model", () => ({
	__esModule: true,
	default: {
		findOne: vi.fn().mockResolvedValue({
			tokens: [],
			save: vi.fn().mockResolvedValue(undefined),
			user: {
				_id: "user123",
				email: "user@example.com",
				toObject: () => ({ _id: "user123", email: "user@example.com" }),
			},
		}),
		findById: vi.fn().mockResolvedValue({
			_id: "user123",
			email: "user@example.com",
			toObject: () => ({ _id: "user123", email: "user@example.com" }),
		}),
		create: vi.fn(),
		deleteOne: vi.fn(),
		deleteMany: vi.fn(),
		updateOne: vi.fn(),
		updateMany: vi.fn(),
		findOneAndUpdate: vi.fn(),
	},
}));

vi.mock("stytch", () => ({
	__esModule: true,
	default: {
		Client: vi.fn().mockImplementation(() => ({
			passwords: {},
			magicLinks: { email: {} },
		})),
	},
}));

vi.mock("../../../src/config/stytch", () => ({
	stytchClient: {
		passwords: {},
		magicLinks: { email: {} },
	},
}));

let shouldAuthenticate = true;
globalThis.shouldAuthenticate = shouldAuthenticate;

describe("POST /api/auth/change-trial", () => {
	const fakeSession = "validSessionToken";
	const userId = "user123";
	const validApiKey = "newApiKey";
	const userMock = {
		_id: userId,
		email: "user@example.com",
		api_key: "encryptedApiKeyValue",
		freeTrial: false,
		toObject: () => ({ _id: userId, email: "user@example.com" }),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		shouldAuthenticate = true;
		globalThis.shouldAuthenticate = shouldAuthenticate;
		(User.findById as Mock).mockResolvedValue(userMock);
		(User.findOne as Mock).mockResolvedValue(userMock);
		(User.findOneAndUpdate as Mock).mockResolvedValue(userMock);
		(User.create as Mock).mockResolvedValue(userMock);
	});

	it("updates user api key with valid api_key and authenticated user", async () => {
		(User.findOneAndUpdate as Mock).mockResolvedValue(userMock);

		const res = await request(app)
			.post("/api/auth/change-trial")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeSession}`,
			])
			.send({ api_key: validApiKey })
			.expect(200);

		expect(res.body).toEqual({ message: "API key updated successfully" });
		expect(encrypt as Mock).toHaveBeenCalledWith(validApiKey);
		expect(User.findOneAndUpdate).toHaveBeenCalledWith(
			{ _id: userId },
			{ api_key: "encryptedApiKeyValue", freeTrial: false },
			{ new: true },
		);
	});

	it("returns 400 if api_key is missing", async () => {
		const res = await request(app)
			.post("/api/auth/change-trial")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeSession}`,
			])
			.send({})
			.expect(400);

		expect(res.body).toHaveProperty("message", "API key is required");
	});

	it("returns 404 if user is not found", async () => {
		(User.findOneAndUpdate as Mock).mockResolvedValue(null);

		const res = await request(app)
			.post("/api/auth/change-trial")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeSession}`,
			])
			.send({ api_key: validApiKey })
			.expect(404);

		expect(res.body).toHaveProperty("message", "User not found");
	});

	it("returns 500 if updating user throws", async () => {
		(User.findOneAndUpdate as Mock).mockRejectedValueOnce(
			new Error("DB error"),
		);

		const res = await request(app)
			.post("/api/auth/change-trial")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeSession}`,
			])
			.send({ api_key: validApiKey })
			.expect(500);

		expect(res.body).toHaveProperty("message");
	});
});
