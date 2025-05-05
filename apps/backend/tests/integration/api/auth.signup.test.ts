// Integration tests for POST /api/auth/signup endpoint
// Uses Vitest, Supertest, and mocks Stytch, token service, and user model for signup flows
import { StytchError } from "stytch";
import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { stytchClient } from "../../../src/config/stytch";
import app from "../../../src/index";

// Mock Stytch and its error for signup scenarios
vi.mock("stytch", () => {
	class StytchError extends Error {
		error_type: string;
		constructor({
			error_type,
			message,
		}: { error_type: string; message: string }) {
			super(message);
			this.error_type = error_type;
		}
	}
	return {
		default: {
			Client: vi.fn().mockImplementation(() => ({
				passwords: {
					create: vi.fn().mockResolvedValue({
						user: { emails: [{ email: "testuser@example.com" }] },
					}),
				},
				magicLinks: {},
			})),
		},
		StytchError,
	};
});

// Mock stytchClient used in the app
vi.mock("../../../src/config/stytch", () => ({
	stytchClient: {
		passwords: {
			create: vi.fn().mockResolvedValue({
				user: { emails: [{ email: "testuser@example.com" }] },
			}),
		},
		magicLinks: {},
	},
}));

// Mock token service for issuing and verifying tokens
vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
	issueAuthTokens: vi.fn().mockResolvedValue(undefined),
}));

// Mock user model for DB lookups and user creation
vi.mock("../../../src/models/user.model", () => ({
	__esModule: true,
	default: {
		findOne: vi.fn().mockResolvedValue(null),
		create: vi
			.fn()
			.mockImplementation(async (data) => ({ _id: "mockedUserId", ...data })),
	},
}));

// Test suite for POST /api/auth/signup
// Covers successful signup, missing fields, duplicate email, unsupported type, and invalid body

describe("POST /api/auth/signup", () => {
	const validEmail = "testuser@example.com";
	const validPassword = "thisIsAPassword123!";

	// Clear all mocks before each test to ensure isolation
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test case: Register new user with valid credentials
	it("registers a new user with valid credentials", async () => {
		const res = await request(app)
			.post("/api/auth/signup")
			.send({
				email: validEmail,
				password: validPassword,
				type: "password_login",
			})
			.expect(200);

		expect(res.body).toEqual({ authenticated: true, email: validEmail });
	});

	// Test case: Missing password
	it("returns 400 if password is missing", async () => {
		const res = await request(app)
			.post("/api/auth/signup")
			.send({ email: validEmail, type: "password_login" })
			.expect(400);

		expect(res.body).toHaveProperty("message", "Password is required");
	});

	// Test case: Duplicate email error from Stytch
	it("returns 400 if email already exists", async () => {
		(stytchClient.passwords.create as Mock).mockRejectedValueOnce(
			new StytchError({
				error_type: "duplicate_email",
				error_message: "Invalid email",
				status_code: 400,
				request_id: "mock-request-id",
				error_url: "https://example.com/error",
			}),
		);

		const res = await request(app)
			.post("/api/auth/signup")
			.send({
				email: validEmail,
				password: validPassword,
				type: "password_login",
			})
			.expect(400);

		expect(res.body).toHaveProperty(
			"message",
			"Email already exists. Please use a different email or change your password.",
		);
	});

	// Test case: Unsupported auth type
	it("returns 400 for unsupported auth type", async () => {
		const res = await request(app)
			.post("/api/auth/signup")
			.send({ email: validEmail, type: "magic_link" })
			.expect(400);

		expect(res.body).toHaveProperty(
			"message",
			"Invalid enum value. Expected 'magic_links' | 'login' | 'password_login' | 'reset_password', received 'magic_link'",
		);
	});

	// Test case: Invalid request body
	it("returns 400 for invalid body", async () => {
		const res = await request(app)
			.post("/api/auth/signup")
			.send({})
			.expect(400);

		expect(res.body).toHaveProperty("message");
	});
});
