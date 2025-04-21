import request from "supertest";
import { type Mock, beforeAll, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";
import * as tokenService from "../../../src/utils/token-service";

// Mock tokenService.verifyAccessToken for integration
vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
}));

// Mock stytchClient for integration
vi.mock("../../../src/config/stytch", () => ({
	stytchClient: {
		magicLinks: {
			email: { loginOrCreate: vi.fn().mockResolvedValue({}) },
			authenticate: vi.fn().mockResolvedValue({
				user: { emails: [{ email: "user@example.com" }] },
			}),
		},
	},
}));

describe("GET /api/auth/status", () => {
	const fakeToken = "validToken";
	const userEmail = "user@example.com";

	beforeAll(() => {
		(tokenService.verifyAccessToken as Mock).mockResolvedValue({
			email: userEmail,
		});
	});

	it("returns authenticated true and email with valid session_token", async () => {
		const res = await request(app)
			.get("/api/auth/status")
			.set("Cookie", `session_token=${fakeToken}`)
			.expect(200);

		expect(res.body).toEqual({ authenticated: true, email: userEmail });
	});

	it("returns authenticated false without session_token", async () => {
		const res = await request(app).get("/api/auth/status").expect(401);

		expect(res.body).toEqual({ authenticated: false, email: undefined });
	});
});
