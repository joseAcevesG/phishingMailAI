import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";
import * as tokenService from "../../../src/utils/token-service";

// Mock tokenService.verifyAccessToken for integration
vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
	deleteAuthToken: vi.fn().mockResolvedValue(undefined),
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

// Mock User model (required for auth middleware)
vi.mock("../../../src/models/user.model", () => ({
	__esModule: true,
	default: {
		findById: vi.fn((id) =>
			Promise.resolve({ _id: id, email: "user@example.com" }),
		),
	},
}));

// Mock stytch to prevent instantiation errors
vi.mock("stytch", () => ({
	__esModule: true,
	default: {
		Client: vi.fn().mockImplementation(() => ({
			passwords: {},
			magicLinks: { email: {} },
		})),
	},
}));

describe("POST /api/auth/logout", () => {
	const fakeToken = "validRefreshToken";
	const fakeSession = "validSessionToken";
	const userId = "user123";
	const userEmail = "user@example.com";

	beforeEach(() => {
		vi.clearAllMocks();
		// By default, mock verifyAccessToken to resolve user
		(tokenService.verifyAccessToken as Mock).mockResolvedValue({
			_id: userId,
			email: userEmail,
		});
	});

	it("logs out user and clears cookies with valid tokens", async () => {
		// Patch: Simulate no token rotation (use original refresh token)
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

	it("returns 401 if refresh_token is missing", async () => {
		const res = await request(app)
			.post("/api/auth/logout")
			.set("Cookie", [`session_token=${fakeSession}`])
			.expect(401);
		expect(res.body).toHaveProperty("message");
	});

	it("returns 401 if user is not authenticated", async () => {
		// Patch: Simulate verifyAccessToken failure
		(tokenService.verifyAccessToken as Mock).mockRejectedValueOnce(
			new Error("Invalid token"),
		);
		// Patch: Simulate rotateAuthTokens failure with UnauthorizedError
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

	it("returns 500 if deleteAuthToken throws", async () => {
		(tokenService.deleteAuthToken as Mock).mockRejectedValueOnce(
			new Error("DB error"),
		);
		// Patch: Simulate no token rotation (use original refresh token)
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
