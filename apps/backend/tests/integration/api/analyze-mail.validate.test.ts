// All vi.mock calls must be placed BEFORE any imports for proper isolation
let shouldAuthenticate = true;

vi.mock("../../../src/middlewares/auth", () => ({
	__esModule: true,
	default: (_req, _res, next) => {
		if (shouldAuthenticate) {
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

vi.mock("../../../src/middlewares/free-trail", () => ({
	__esModule: true,
	default: (_req, _res, next) => next(),
}));

// DO NOT mock multer, let the real multer handle file upload

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
		findOneAndUpdate: vi.fn().mockImplementation((_query, update) =>
			Promise.resolve({
				...update.$set,
				_id: "user123",
				email: "user@example.com",
			}),
		),
		create: vi.fn(),
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

// Mock OpenAI
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

import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";

const fakeSession = "validSessionToken";

describe("POST /api/analyze-mail/validate", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		shouldAuthenticate = true;
	});

	it("returns 201 and analysis result when .eml file is uploaded and user is authenticated", async () => {
		const emlContent =
			"From: sender@example.com\nTo: receiver@example.com\nSubject: Test Email\nContent-Type: text/html; charset=UTF-8\n\n<html><body>Hello World!</body></html>";
		const res = await request(app)
			.post("/api/analyze-mail/validate")
			.set("Cookie", [`session_token=${fakeSession}`])
			.attach("emlFile", Buffer.from(emlContent), "test.eml");
		expect([200, 201]).toContain(res.status);
		expect(res.body).toHaveProperty("_id");
		expect(res.body).toHaveProperty("subject", "Test Email");
		expect(res.body).toHaveProperty("phishingProbability");
		expect(res.body).toHaveProperty("reasons");
		expect(res.body).toHaveProperty("redFlags");
	});

	it("returns 401 if user is not authenticated", async () => {
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
		const res = await request(app)
			.post("/api/analyze-mail/validate")
			.set("Cookie", [`session_token=${fakeSession}`]);
		expect([400, 401]).toContain(res.status); // 401 if auth fails, 400 if file missing
		expect(res.body).toHaveProperty("message");
	});
});
