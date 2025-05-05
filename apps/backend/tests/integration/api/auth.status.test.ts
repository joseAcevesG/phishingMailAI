// Integration tests for GET /api/auth/status endpoint
// Uses Vitest, Supertest, and mocks token service and Stytch client for authentication status checks
import request from "supertest";
import { type Mock, beforeAll, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";
import * as tokenService from "../../../src/utils/token-service";

// Mock token service to simulate access token verification
vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
}));
// Mock Stytch client to avoid external API calls
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

// Test suite for GET /api/auth/status
// Covers authenticated and unauthenticated scenarios

describe("GET /api/auth/status", () => {
	const fakeToken = "validToken";
	const userEmail = "user@example.com";

	// Set up mock for authenticated user before all tests
	beforeAll(() => {
		(tokenService.verifyAccessToken as Mock).mockResolvedValue({
			email: userEmail,
		});
	});

	// Test case: Authenticated user with valid session_token
	it("returns authenticated true and email with valid session_token", async () => {
		const res = await request(app)
			.get("/api/auth/status")
			.set("Cookie", `session_token=${fakeToken}`)
			.expect(200);

		expect(res.body).toEqual({ authenticated: true, email: userEmail });
	});

	// Test case: Unauthenticated user without session_token
	it("returns authenticated false without session_token", async () => {
		const res = await request(app).get("/api/auth/status").expect(401);

		expect(res.body).toEqual({ authenticated: false, email: undefined });
	});
});
