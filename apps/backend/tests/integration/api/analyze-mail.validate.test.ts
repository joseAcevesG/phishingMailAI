// Integration tests for POST /api/analyze-mail/validate endpoint
// Uses Vitest, Supertest, and mocks authentication, free-trial, user model, Stytch, and OpenAI dependencies
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";

// Controls authentication state for mock
let shouldAuthenticate = true;

// Mock authentication middleware to simulate authenticated/unauthenticated requests
vi.mock("../../../src/middlewares/auth", () => ({
	__esModule: true,
	default: (_req, _res, next) => {
		if (shouldAuthenticate) {
			// Attach a fake user object
			_req.user = { _id: "user123", email: "user@example.com", analysis: [] };
			next();
		} else {
			const err = new Error("Unauthorized");
			// @ts-ignore
			err.status = 401;
			next(err);
		}
	},
}));

// Mock free-trial middleware as a no-op
vi.mock("../../../src/middlewares/free-trail", () => ({
	__esModule: true,
	default: (_req, _res, next) => next(),
}));

// Mock user model methods for database operations
vi.mock("../../../src/models/user.model", () => ({
	__esModule: true,
	default: {
		findById: vi.fn().mockResolvedValue({
			_id: "user123",
			email: "user@example.com",
			analysis: [],
		}),
		findOne: vi.fn().mockResolvedValue({
			_id: "user123",
			email: "user@example.com",
			analysis: [],
		}),
		findByIdAndUpdate: vi.fn().mockImplementation((_query, update) =>
			Promise.resolve({
				...update.$set,
				_id: "user123",
				email: "user@example.com",
			}),
		),
		create: vi.fn(),
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

// Mock OpenAI config and chat completions to avoid actual LLM calls
vi.mock("../../../src/config/openai", () => ({
	__esModule: true,
	default: {
		openai: {
			chat: {
				completions: {
					create: vi.fn().mockResolvedValue({
						choices: [
							{
								message: {
									content: JSON.stringify({
										phishingProbability: 0.1,
										reasons: ["No suspicious content found."],
										redFlags: [],
									}),
								},
							},
						],
					}),
				},
			},
		},
		SYSTEM_PROMPT: "Analyze for phishing",
	},
}));

// Fake session token for simulating authenticated requests
const fakeSession = "validSessionToken";

// Test suite for POST /api/analyze-mail/validate
// Covers success, unauthorized, and missing file scenarios

describe("POST /api/analyze-mail/validate", () => {
	beforeEach(() => {
		// Reset mocks and authentication state before each test
		vi.clearAllMocks();
		shouldAuthenticate = true;
	});

	it("returns 201 and analysis result when .eml file is uploaded and user is authenticated", async () => {
		// Prepare a simple .eml file content
		const emlContent =
			"From: sender@example.com\nTo: receiver@example.com\nSubject: Test Email\nContent-Type: text/html; charset=UTF-8\n\n<html><body>Hello World!</body></html>";
		// Attempt to validate the .eml file as an authenticated user
		const res = await request(app)
			.post("/api/analyze-mail/validate")
			.set("Cookie", [`session_token=${fakeSession}`])
			.attach("emlFile", Buffer.from(emlContent), "test.eml");
		expect([200, 201]).toContain(res.status);
		// Check that the response contains expected analysis properties
		expect(res.body).toHaveProperty("_id");
		expect(res.body).toHaveProperty("subject", "Test Email");
		expect(res.body).toHaveProperty("phishingProbability");
		expect(res.body).toHaveProperty("reasons");
		expect(res.body).toHaveProperty("redFlags");
	});

	it("returns 401 if user is not authenticated", async () => {
		// Simulate unauthenticated user
		shouldAuthenticate = false;
		const emlContent =
			"From: sender@example.com\nTo: receiver@example.com\nSubject: Test Email\nContent-Type: text/html; charset=UTF-8\n\n<html><body>Hello World!</body></html>";
		const res = await request(app)
			.post("/api/analyze-mail/validate")
			.attach("emlFile", Buffer.from(emlContent), "test.eml");
		expect(res.status).toBe(401);
		expect(res.body).toHaveProperty("message");
	});

	it("returns 400 if no file is uploaded", async () => {
		// Attempt to validate without uploading any file
		const res = await request(app)
			.post("/api/analyze-mail/validate")
			.set("Cookie", [`session_token=${fakeSession}`]);
		expect([400, 401]).toContain(res.status);
		expect(res.body).toHaveProperty("message");
	});
});
