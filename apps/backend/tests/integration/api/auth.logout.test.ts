// Integration tests for POST /api/auth/logout endpoint
// Uses Vitest, Supertest, and mocks token service, user model, and Stytch dependencies
import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";
import * as tokenService from "../../../src/utils/token-service";

// Mock token service to simulate token verification, deletion, and rotation
vi.mock("../../../src/utils/token-service", () => ({
	// Mock verifyAccessToken to return a valid user
	verifyAccessToken: vi.fn(),
	// Mock deleteAuthToken to resolve without errors
	deleteAuthToken: vi.fn().mockResolvedValue(undefined),
	// Mock rotateAuthTokens to return a new refresh token
	rotateAuthTokens: vi.fn().mockResolvedValue({
		user: {
			_id: "user123",
			email: "user@example.com",
			toObject: function () {
				return this;
			},
		},
		newRefreshToken: "newRefreshToken",
	}),
}));

// Mock user model to simulate DB lookups
vi.mock("../../../src/models/user.model", () => ({
	__esModule: true,
	default: {
		// Mock findById to return a user by ID
		findById: vi.fn((id) =>
			Promise.resolve({ _id: id, email: "user@example.com" }),
		),
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

// Test suite for POST /api/auth/logout
// Covers successful logout, missing token, unauthenticated user, and DB error scenarios
describe("POST /api/auth/logout", () => {
	const fakeToken = "validRefreshToken";
	const fakeSession = "validSessionToken";
	const userId = "user123";
	const userEmail = "user@example.com";

	// Clear all mocks before each test
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock token verification to return a valid user
		(tokenService.verifyAccessToken as Mock).mockResolvedValue({
			_id: userId,
			email: userEmail,
		});
	});

	// Test successful logout with valid tokens
	it("logs out user and clears cookies with valid tokens", async () => {
		// Simulate successful token rotation
		(tokenService.rotateAuthTokens as Mock).mockResolvedValueOnce({
			user: {
				_id: userId,
				email: userEmail,
				toObject: function () {
					return this;
				},
			},
			newRefreshToken: fakeToken,
		});

		const res = await request(app)
			.post("/api/auth/logout")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeToken}`,
			])
			.expect(200);

		// Verify response and that cookies are cleared
		expect(res.body).toEqual({ message: "Logged out successfully" });
		const cookies = res.headers["set-cookie"];
		const cookiesArr = Array.isArray(cookies) ? cookies : [cookies];
		expect(cookiesArr).toBeTruthy();
		expect(
			cookiesArr.some((c: string) => c.startsWith("session_token=;")),
		).toBeTruthy();
		expect(
			cookiesArr.some((c: string) => c.startsWith("refresh_token=;")),
		).toBeTruthy();
		expect(tokenService.deleteAuthToken).toHaveBeenCalledWith(
			userId,
			fakeToken,
		);
	});

	// Test missing refresh token
	it("returns 401 if refresh_token is missing", async () => {
		// Simulate missing refresh_token in cookies
		const res = await request(app)
			.post("/api/auth/logout")
			.set("Cookie", [`session_token=${fakeSession}`])
			.expect(401);
		expect(res.body).toHaveProperty("message");
	});

	// Test unauthenticated user
	it("returns 401 if user is not authenticated", async () => {
		// Simulate invalid session token
		(tokenService.verifyAccessToken as Mock).mockRejectedValueOnce(
			new Error("Invalid token"),
		);
		const { UnauthorizedError } = await import("../../../src/utils/errors");
		(tokenService.rotateAuthTokens as Mock).mockRejectedValueOnce(
			new UnauthorizedError("Invalid refresh token"),
		);
		const res = await request(app)
			.post("/api/auth/logout")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeToken}`,
			])
			.expect(401);
		expect(res.body).toHaveProperty("message");
	});

	// Test DB error during token deletion
	it("returns 500 if deleteAuthToken throws", async () => {
		// Simulate DB error during token deletion
		(tokenService.deleteAuthToken as Mock).mockRejectedValueOnce(
			new Error("DB error"),
		);
		(tokenService.rotateAuthTokens as Mock).mockResolvedValueOnce({
			user: {
				_id: userId,
				email: userEmail,
				toObject: function () {
					return this;
				},
			},
			newRefreshToken: fakeToken,
		});
		const res = await request(app)
			.post("/api/auth/logout")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeToken}`,
			])
			.expect(500);
		expect(res.body).toHaveProperty("message");
	});
});
