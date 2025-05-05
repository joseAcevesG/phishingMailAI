// Integration tests for POST /api/auth/logout-all endpoint
// Uses Vitest, Supertest, and mocks authentication, token service, user model, and Stytch dependencies
import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";
import User from "../../../src/models/user.model";
import * as tokenService from "../../../src/utils/token-service";

// Controls authentication state for mock
let shouldAuthenticate = true;

// Mock authentication middleware to simulate authenticated/unauthenticated requests
vi.mock("../../../src/middleware/auth", () => ({
	__esModule: true,
	default: (_req, _res, next) => {
		if (shouldAuthenticate) {
			// Attach a fake user object to the request
			_req.user = { _id: "user123", email: "user@example.com" };
			next();
		} else {
			const err = new Error("Unauthorized");
			// @ts-ignore
			err.status = 401;
			next(err);
		}
	},
}));

// Mock token service to simulate token verification and deletion
vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
	deleteAllAuthTokens: vi.fn().mockResolvedValue(undefined),
	rotateAuthTokens: vi.fn().mockResolvedValue({
		user: {
			_id: "user123",
			email: "user@example.com",
			toObject() {
				return this;
			},
		},
		newRefreshToken: "newRefreshToken",
	}),
}));

// Mock user model for DB lookups
vi.mock("../../../src/models/user.model", () => ({
	__esModule: true,
	default: {
		findById: vi.fn(),
		findByIdAndUpdate: vi.fn(),
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

// Test suite for POST /api/auth/logout-all
// Covers successful logout, unauthenticated user, and DB error scenarios

describe("POST /api/auth/logout-all", () => {
	const fakeSession = "validSessionToken";
	const userId = "user123";
	const userEmail = "user@example.com";

	beforeEach(() => {
		vi.clearAllMocks();
		shouldAuthenticate = true;
		// Mock token verification and user lookup
		(tokenService.verifyAccessToken as Mock).mockResolvedValue({
			_id: userId,
			email: userEmail,
		});
		(User.findById as Mock).mockResolvedValue({
			_id: userId,
			email: userEmail,
		});
		(User.findByIdAndUpdate as Mock).mockResolvedValue({
			_id: userId,
			email: userEmail,
		});
	});

	it("logs out user from all sessions and clears cookies with valid session_token", async () => {
		// Simulate successful logout from all sessions
		const res = await request(app)
			.post("/api/auth/logout-all")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeSession}`,
			])
			.expect(200);

		// Verify response and that cookies are cleared
		expect(res.body).toEqual({ message: "Logged out from all sessions" });
		const cookies = res.headers["set-cookie"];
		const cookiesArr = Array.isArray(cookies) ? cookies : [cookies];
		expect(cookiesArr).toBeTruthy();
		expect(
			cookiesArr.some((c: string) => c.startsWith("session_token=;")),
		).toBeTruthy();
		expect(
			cookiesArr.some((c: string) => c.startsWith("refresh_token=;")),
		).toBeTruthy();
		expect(tokenService.deleteAllAuthTokens).toHaveBeenCalledWith(userId);
	});

	it("returns 401 if user is not authenticated", async () => {
		// Simulate unauthenticated user
		shouldAuthenticate = false;
		(tokenService.verifyAccessToken as Mock).mockRejectedValueOnce(
			new Error("Invalid token"),
		);
		const res = await request(app).post("/api/auth/logout-all").expect(401);
		expect(res.body).toHaveProperty("message");
	});

	it("returns 500 if deleteAllAuthTokens throws", async () => {
		// Simulate DB error during logout
		(tokenService.deleteAllAuthTokens as Mock).mockRejectedValueOnce(
			new Error("DB error"),
		);
		const res = await request(app)
			.post("/api/auth/logout-all")
			.set("Cookie", [
				`session_token=${fakeSession}`,
				`refresh_token=${fakeSession}`,
			])
			.expect(500);
		expect(res.body).toHaveProperty("message");
	});
});
