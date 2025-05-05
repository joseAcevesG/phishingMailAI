// Integration tests for POST /api/auth/reset-password endpoint
// Uses Vitest, Supertest, and mocks Stytch client for password reset flows
import { StytchError } from "stytch";
import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { stytchClient } from "../../../src/config/stytch";
import app from "../../../src/index";

// Mock Stytch and its error for password reset scenarios
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
					email: {
						resetStart: vi.fn().mockResolvedValue({}),
					},
				},
			})),
		},
		StytchError,
	};
});

// Mock stytchClient used in the app
vi.mock("../../../src/config/stytch", () => ({
	stytchClient: {
		passwords: {
			email: {
				resetStart: vi.fn().mockResolvedValue({}),
			},
		},
	},
}));

// Test suite for POST /api/auth/reset-password
// Covers valid email, missing/invalid email, and Stytch error scenarios

describe("POST /api/auth/reset-password", () => {
	const validEmail = "testuser@example.com";

	// Clear all mocks before each test to ensure isolation
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test case: Send password reset link for valid email
	it("sends password reset link for valid email", async () => {
		// Simulate successful password reset link send
		const res = await request(app)
			.post("/api/auth/reset-password")
			.send({ email: validEmail })
			.expect(200);

		// Verify response message and Stytch client call
		expect(res.body).toHaveProperty(
			"message",
			"Password reset link sent successfully",
		);
		expect(stytchClient.passwords.email.resetStart).toHaveBeenCalledWith({
			email: validEmail,
		});
	});

	// Test case: Return 400 for missing email
	it("returns 400 for missing email", async () => {
		// Simulate missing email in request body
		const res = await request(app)
			.post("/api/auth/reset-password")
			.send({})
			.expect(400);
		// Verify response has a message
		expect(res.body).toHaveProperty("message");
	});

	// Test case: Return 400 for invalid email format
	it("returns 400 for invalid email format", async () => {
		// Simulate invalid email format
		const res = await request(app)
			.post("/api/auth/reset-password")
			.send({ email: "not-an-email" })
			.expect(400);
		// Verify response has a message
		expect(res.body).toHaveProperty("message");
	});

	// Test case: Return 400 if Stytch returns invalid_email error
	it("returns 400 if stytch returns invalid_email error", async () => {
		// Simulate Stytch error for invalid email
		(stytchClient.passwords.email.resetStart as Mock).mockRejectedValueOnce(
			new StytchError({
				error_type: "invalid_email",
				error_message: "Invalid email",
				status_code: 400,
				request_id: "mock-request-id",
				error_url: "https://example.com/error",
			}),
		);
		const res = await request(app)
			.post("/api/auth/reset-password")
			.send({ email: "bademail@example.com" })
			.expect(400);
		// Verify response has a message
		expect(res.body).toHaveProperty("message");
	});
});
