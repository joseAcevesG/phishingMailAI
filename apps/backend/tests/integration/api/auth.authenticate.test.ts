// Integration tests for POST /api/auth/authenticate endpoint
// Uses Vitest, Supertest, and mocks token service, user model, and Stytch dependencies
import { authTypes } from "shared/auth-types";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";

// Constants for valid test user and token
const validEmail = "testuser@example.com";
const validToken = "valid-auth-token";

// Mock token-service to simulate token verification and issuance
vi.mock("../../../src/utils/token-service", () => ({
	__esModule: true,
	verifyAuthToken: vi.fn((token: string) => {
		if (token === validToken) {
			// Return a valid user object if token matches
			return { _id: "user123", email: validEmail };
		}
		// Throw error for invalid tokens
		throw new Error("Invalid token");
	}),
	issueAuthTokens: vi.fn().mockResolvedValue(undefined),
}));

// Mock user model to simulate DB lookups and creation
vi.mock("../../../src/models/user.model", () => {
	return {
		__esModule: true,
		default: {
			findOne: vi.fn().mockImplementation(({ email }) => {
				if (email === validEmail) {
					// Return mock user for valid email
					return Promise.resolve({ _id: "mock-user-id", email: validEmail });
				}
				// Simulate user not found
				return Promise.resolve(null);
			}),
			create: vi.fn().mockImplementation(({ email }) => {
				// Simulate user creation
				return Promise.resolve({ _id: "mock-user-id", email });
			}),
			findById: vi.fn((id: string) => {
				if (id === "user123") {
					return Promise.resolve({ _id: "user123", email: validEmail });
				}
				return Promise.resolve(null);
			}),
		},
	};
});

// Mock Stytch client to simulate magic link authentication and error handling
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
		__esModule: true,
		default: {
			Client: vi.fn().mockImplementation(() => ({
				magicLinks: {
					authenticate: vi.fn().mockImplementation(({ token }) => {
						if (token === validToken) {
							// Return user info for valid token
							return Promise.resolve({
								user: { emails: [{ email: validEmail }] },
							});
						}
						// Simulate Stytch error for invalid token
						return Promise.reject(
							new StytchError({
								error_type: "invalid_token",
								error_message: "Invalid token",
								status_code: 400,
								request_id: "mock-request-id",
								error_url: "https://example.com/error",
							}),
						);
					}),
				},
			})),
		},
		StytchError,
	};
});

// Test suite for POST /api/auth/authenticate
// Covers valid authentication, missing/invalid tokens, and user not found

describe("POST /api/auth/authenticate", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("authenticates user with valid token", async () => {
		// Simulate authentication with a valid token
		const res = await request(app)
			.post("/api/auth/authenticate")
			.send()
			.query({ token: validToken, stytch_token_type: authTypes.magicLink })
			.expect(200);
		// Expect successful authentication and correct email
		expect(res.body).toHaveProperty("authenticated", true);
		expect(res.body).toHaveProperty("email", validEmail);
	});

	it("returns 400 if token is missing", async () => {
		// Simulate missing token in request
		const res = await request(app)
			.post("/api/auth/authenticate")
			.send()
			.query({ stytch_token_type: "login" })
			.expect(400);
		expect(res.body).toHaveProperty("message");
	});

	it("returns 400 if token is invalid", async () => {
		// Simulate authentication with an invalid token
		const res = await request(app)
			.post("/api/auth/authenticate")
			.send()
			.query({ token: "invalid-token", stytch_token_type: "login" })
			.expect(400);
		expect(res.body).toHaveProperty("message");
	});

	it("returns 400 if user not found", async () => {
		// Simulate valid token but user does not exist in DB
		const res = await request(app)
			.post("/api/auth/authenticate")
			.send()
			.query({
				token: "valid-auth-token-but-no-user",
				stytch_token_type: "login",
			})
			.expect(400);
		expect(res.body).toHaveProperty("message");
	});
});
