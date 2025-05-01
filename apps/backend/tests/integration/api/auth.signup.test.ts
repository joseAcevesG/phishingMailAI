import { StytchError } from "stytch";

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

vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
	issueAuthTokens: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../src/models/user.model", () => ({
	__esModule: true,
	default: {
		findOne: vi.fn().mockResolvedValue(null),
		create: vi
			.fn()
			.mockImplementation(async (data) => ({ _id: "mockedUserId", ...data })),
	},
}));

import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { stytchClient } from "../../../src/config/stytch";
import app from "../../../src/index";

// Mock tokenService.verifyAccessToken and issueAuthTokens for integration

describe("POST /api/auth/signup", () => {
	const validEmail = "testuser@example.com";
	const validPassword = "thisIsAPassword123!";

	beforeEach(() => {
		// Optionally reset mocks if needed
		vi.clearAllMocks();
	});

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

	it("returns 400 if password is missing", async () => {
		const res = await request(app)
			.post("/api/auth/signup")
			.send({ email: validEmail, type: "password_login" })
			.expect(400);

		expect(res.body).toHaveProperty("message", "Password is required");
	});

	it("returns 400 if email already exists", async () => {
		// Simulate Stytch email_duplicate error
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

	it("returns 400 for invalid body", async () => {
		const res = await request(app)
			.post("/api/auth/signup")
			.send({})
			.expect(400);

		expect(res.body).toHaveProperty("message");
	});
});
