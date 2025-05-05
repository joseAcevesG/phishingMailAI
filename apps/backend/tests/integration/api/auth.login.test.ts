// Integration tests for POST /api/auth/login endpoint
// Uses Vitest, Supertest, and mocks Stytch, stytch config, token service, and user model dependencies
import { StytchError } from "stytch";
import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { stytchClient } from "../../../src/config/stytch";
import app from "../../../src/index";

// Mock Stytch client and error class to simulate authentication flows
vi.mock("stytch", () => {
	class StytchError extends Error {
		error_type: string;
		error_message: string;
		status_code: number;
		request_id: string;
		error_url: string;
		constructor({
			error_type,
			error_message,
			status_code,
			request_id,
			error_url,
		}: {
			error_type: string;
			error_message: string;
			status_code: number;
			request_id: string;
			error_url: string;
		}) {
			super(error_message);
			this.error_type = error_type;
			this.error_message = error_message;
			this.status_code = status_code;
			this.request_id = request_id;
			this.error_url = error_url;
		}
	}
	return {
		default: {
			Client: vi.fn().mockImplementation(() => ({
				passwords: {
					authenticate: vi.fn().mockResolvedValue({
						user: { emails: [{ email: "testuser@example.com" }] },
					}),
				},
				magicLinks: {
					email: {
						loginOrCreate: vi.fn().mockResolvedValue({}),
					},
				},
			})),
		},
		StytchError,
	};
});

// Mock stytch config to simulate stytchClient's password and magic link methods
vi.mock("../../../src/config/stytch", () => ({
	stytchClient: {
		passwords: {
			authenticate: vi.fn().mockResolvedValue({
				user: { emails: [{ email: "testuser@example.com" }] },
			}),
		},
		magicLinks: {
			email: {
				loginOrCreate: vi.fn().mockResolvedValue({}),
			},
		},
	},
}));

// Mock token service to simulate token verification and issuance
vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
	issueAuthTokens: vi.fn().mockResolvedValue(undefined),
}));

// Mock user model to simulate DB lookups and creation
vi.mock("../../../src/models/user.model", () => ({
	__esModule: true,
	default: {
		findOne: vi.fn().mockResolvedValue({
			_id: "mockedUserId",
			email: "testuser@example.com",
		}),
		create: vi
			.fn()
			.mockImplementation(async (data) => ({ _id: "mockedUserId", ...data })),
	},
}));

// Test suite for POST /api/auth/login
// Covers password login, magic link login, missing/invalid credentials, and Stytch errors

describe("POST /api/auth/login", () => {
	const validEmail = "testuser@example.com";
	const validPassword = "thisIsAPassword123!";

	// Clear all mocks before each test to ensure isolation
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test case: Successful password login with valid credentials
	it("logs in a user with valid credentials (password_login)", async () => {
		// Simulate password login with valid credentials
		const res = await request(app)
			.post("/api/auth/login")
			.send({
				email: validEmail,
				password: validPassword,
				type: "password_login",
			})
			.expect(200);

		// Verify successful login response
		expect(res.body).toEqual({ authenticated: true, email: validEmail });
	});

	// Test case: Missing password for password_login
	it("returns 400 if password is missing for password_login", async () => {
		// Simulate missing password for password_login
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: validEmail, type: "password_login" })
			.expect(400);
		// Verify error response for missing password
		expect(res.body).toHaveProperty("message", "Password is required");
	});

	// Test case: Unsupported authentication type
	it("returns 400 for unsupported auth type", async () => {
		// Simulate unsupported authentication type
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: validEmail, type: "unsupported_type" })
			.expect(400);
		// Verify error response for unsupported type
		expect(res.body).toHaveProperty("message");
	});

	// Test case: Invalid request body
	it("returns 400 for invalid body", async () => {
		// Simulate missing required fields in request body
		const res = await request(app).post("/api/auth/login").send({}).expect(400);
		// Verify error response for invalid body
		expect(res.body).toHaveProperty("message");
	});

	// Test case: Stytch error for invalid email
	it("returns 400 if stytch returns invalid_email error", async () => {
		// Simulate Stytch error for invalid email
		(stytchClient.passwords.authenticate as Mock).mockRejectedValueOnce(
			new StytchError({
				error_type: "invalid_email",
				error_message: "Invalid email",
				status_code: 400,
				request_id: "mock-request-id",
				error_url: "https://example.com/error",
			}),
		);
		const res = await request(app)
			.post("/api/auth/login")
			.send({
				email: "bademail@example.com",
				password: validPassword,
				type: "password_login",
			})
			.expect(400);
		// Verify error response for Stytch error
		expect(res.body).toHaveProperty("message");
	});

	// Test case: Successful magic link login
	it("logs in a user with magic link", async () => {
		// Simulate magic link login
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: validEmail, type: "magic_links" })
			.expect(200);
		// Verify successful login response
		expect(res.body).toHaveProperty("message");
	});
});
