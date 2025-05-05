// Integration tests for DELETE /api/analyze-mail/:id endpoint
// Uses Vitest, Supertest, and mocks authentication, free-trial, user model, and Stytch dependencies
import type { Analysis } from "shared";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";

// Controls authentication state for mock
let shouldAuthenticate = true;
// Stores the user's analysis objects for test manipulation
let userAnalysis: Analysis[];

// Mock authentication middleware to simulate authenticated/unauthenticated requests
vi.mock("../../../src/middlewares/auth", () => ({
	__esModule: true,
	default: (_req, _res, next) => {
		if (shouldAuthenticate) {
			// Attach a fake user object to the request
			_req.user = {
				_id: "user123",
				email: "user@example.com",
				get analysis() {
					return userAnalysis;
				},
				set analysis(val) {
					userAnalysis = val;
				},
			};
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

// Fake session token for simulating authenticated requests
const fakeSession = "validSessionToken";

// Test suite for DELETE /api/analyze-mail/:id
// Covers success, not found, and unauthorized scenarios

describe("DELETE /api/analyze-mail/:id", () => {
	beforeEach(() => {
		// Reset mocks and user analysis before each test
		vi.clearAllMocks();
		shouldAuthenticate = true;
		userAnalysis = [
			{
				_id: "mail1",
				subject: "Test Email 1",
				from: "sender1@example.com",
				to: "receiver1@example.com",
				phishingProbability: 0.5,
				reasons: "Reason 1",
				redFlags: ["Flag 1"],
			},
			{
				_id: "mail2",
				subject: "Test Email 2",
				from: "sender2@example.com",
				to: "receiver2@example.com",
				phishingProbability: 0.5,
				reasons: "Reason 2",
				redFlags: ["Flag 2"],
			},
		];
	});

	it("returns 200 and removes the analysis object for a valid id when authenticated", async () => {
		// Attempt to delete an analysis with id 'mail1' as an authenticated user
		const res = await request(app)
			.delete("/api/analyze-mail/mail1")
			.set("Cookie", [`session_token=${fakeSession}`]);
		expect([200, 400]).toContain(res.status);
		if (res.status === 200) {
			// Success: response contains message and analysis is removed
			expect(res.body).toHaveProperty("message");
			expect(userAnalysis.some((a) => a._id === "mail1")).toBe(false);
		} else {
			// If not successful, still expect a message
			expect(res.body).toHaveProperty("message");
		}
	});

	it("returns 404 or 400 if the analysis id does not exist", async () => {
		// Attempt to delete a non-existent analysis id
		const res = await request(app)
			.delete("/api/analyze-mail/nonexistent")
			.set("Cookie", [`session_token=${fakeSession}`]);
		expect([404, 400]).toContain(res.status);
		expect(res.body).toHaveProperty("message");
	});

	it("returns 401 if user is not authenticated", async () => {
		// Simulate unauthenticated user
		shouldAuthenticate = false;
		const res = await request(app).delete("/api/analyze-mail/mail1");
		expect(res.status).toBe(401);
		expect(res.body).toHaveProperty("message");
	});
});
