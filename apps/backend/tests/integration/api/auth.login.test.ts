import { StytchError } from "stytch";
import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { stytchClient } from "../../../src/config/stytch";
import app from "../../../src/index";

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

vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
	issueAuthTokens: vi.fn().mockResolvedValue(undefined),
}));

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

describe("POST /api/auth/login", () => {
	const validEmail = "testuser@example.com";
	const validPassword = "thisIsAPassword123!";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("logs in a user with valid credentials (password_login)", async () => {
		const res = await request(app)
			.post("/api/auth/login")
			.send({
				email: validEmail,
				password: validPassword,
				type: "password_login",
			})
			.expect(200);

		expect(res.body).toEqual({ authenticated: true, email: validEmail });
	});

	it("returns 400 if password is missing for password_login", async () => {
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: validEmail, type: "password_login" })
			.expect(400);
		expect(res.body).toHaveProperty("message", "Password is required");
	});

	it("returns 400 for unsupported auth type", async () => {
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: validEmail, type: "unsupported_type" })
			.expect(400);
		expect(res.body).toHaveProperty("message");
	});

	it("returns 400 for invalid body", async () => {
		const res = await request(app).post("/api/auth/login").send({}).expect(400);
		expect(res.body).toHaveProperty("message");
	});

	it("returns 400 if stytch returns invalid_email error", async () => {
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
		expect(res.body).toHaveProperty("message");
	});

	it("logs in a user with magic link", async () => {
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: validEmail, type: "magic_links" })
			.expect(200);
		expect(res.body).toHaveProperty("message");
	});
});
