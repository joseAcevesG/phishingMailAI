// Integration tests for POST /api/auth/change-trial endpoint
// Uses Vitest, Supertest, and mocks authentication, encryption, user model, refresh token model, and Stytch dependencies
import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";
import User from "../../../src/models/user.model";
import { encrypt } from "../../../src/utils/encrypt-string";

// Mock authentication middleware to simulate authenticated/unauthenticated requests
vi.mock("../../../src/middleware/auth", () => ({
	__esModule: true,
	default: (_req, _res, next) => {
		if (globalThis.shouldAuthenticate) {
			// Attach a fake user object
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

// Mock encrypt utility to simulate API key encryption
vi.mock("../../../src/utils/encrypt-string", () => ({
	encrypt: vi.fn().mockResolvedValue("encryptedApiKeyValue"),
}));

// Mock user model methods for database operations
vi.mock("../../../src/models/user.model", () => ({
	__esModule: true,
	default: {
		findOneAndUpdate: vi.fn(),
		findById: vi.fn(),
		findOne: vi.fn(),
		create: vi.fn(),
	},
}));

// Mock refresh token model methods
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

// Mock Stytch client to avoid external API calls
vi.mock("stytch", () => ({
	__esModule: true,
	default: {
		Client: vi.fn().mockImplementation(() => ({
			passwords: {},
			magicLinks: { email: {} },
		})),
	},
}));

// Mock Stytch config
vi.mock("../../../src/config/stytch", () => ({
	stytchClient: {
		passwords: {},
		magicLinks: { email: {} },
	},
}));

// Controls authentication state for mock
let shouldAuthenticate = true;
globalThis.shouldAuthenticate = shouldAuthenticate;

// Test suite for POST /api/auth/change-trial
// Covers API key update, missing API key, user not found, and DB error scenarios

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

	// Before each test, clear mocks and set up default user model behavior
	beforeEach(() => {
		vi.clearAllMocks();
		shouldAuthenticate = true;
		globalThis.shouldAuthenticate = shouldAuthenticate;
		// Set up user model mocks to return userMock by default
		(User.findById as Mock).mockResolvedValue(userMock);
		(User.findOne as Mock).mockResolvedValue(userMock);
		(User.findOneAndUpdate as Mock).mockResolvedValue(userMock);
		(User.create as Mock).mockResolvedValue(userMock);
	});

	// Test successful API key update with valid api_key and authenticated user
	it("updates user api key with valid api_key and authenticated user", async () => {
		// Simulate successful API key update
		(User.findOneAndUpdate as Mock).mockResolvedValue(userMock);

		const res = await request(app)
			.post("/api/auth/change-trial")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeSession}`,
			])
			.send({ api_key: validApiKey })
			.expect(200);

		// Verify API key update response and encryption
		expect(res.body).toEqual({ message: "API key updated successfully" });
		expect(encrypt as Mock).toHaveBeenCalledWith(validApiKey);
		expect(User.findOneAndUpdate).toHaveBeenCalledWith(
			{ _id: userId },
			{ api_key: "encryptedApiKeyValue", freeTrial: false },
			{ new: true },
		);
	});

	// Test missing api_key in request body
	it("returns 400 if api_key is missing", async () => {
		// Simulate missing api_key in request body
		const res = await request(app)
			.post("/api/auth/change-trial")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeSession}`,
			])
			.send({})
			.expect(400);

		// Verify error response
		expect(res.body).toHaveProperty("message", "API key is required");
	});

	// Test user not found in DB
	it("returns 404 if user is not found", async () => {
		// Simulate user not found in DB
		(User.findOneAndUpdate as Mock).mockResolvedValue(null);

		const res = await request(app)
			.post("/api/auth/change-trial")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeSession}`,
			])
			.send({ api_key: validApiKey })
			.expect(404);

		// Verify error response
		expect(res.body).toHaveProperty("message", "User not found");
	});

	// Test DB error during update
	it("returns 500 if updating user throws", async () => {
		// Simulate DB error during update
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

		// Verify error response
		expect(res.body).toHaveProperty("message");
	});
});
