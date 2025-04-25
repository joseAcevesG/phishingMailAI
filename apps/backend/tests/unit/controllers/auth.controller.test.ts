import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
// Stub stytchClient to avoid config environment check
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
// Mock token-service to stub auth flows
vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
	rotateAuthTokens: vi.fn(),
}));
import type { Request, Response } from "express";
import AuthController from "../../../src/controllers/auth.controller";
import StatusCodes from "../../../src/utils/response-codes";
import * as tokenService from "../../../src/utils/token-service";

// Type for verifyAccessToken mock return
type VerifyAccessReturn = Awaited<
	ReturnType<typeof tokenService.verifyAccessToken>
>;

// Type for the resolved value of rotateAuthTokens
type RotateAuthReturn = Awaited<
	ReturnType<typeof tokenService.rotateAuthTokens>
>;

describe("AuthController", () => {
	describe("status", () => {
		let req: Partial<Request>;
		let res: Partial<Response> & { status: Mock; json: Mock };

		beforeEach(() => {
			req = { cookies: {} };
			res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
		});

		it("should return authenticated true and email when session token is valid", async () => {
			// Arrange
			req.cookies = { session_token: "validToken" };
			vi.spyOn(tokenService, "verifyAccessToken").mockResolvedValue({
				email: "user@example.com",
			} as VerifyAccessReturn);

			// Act
			AuthController.status(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));

			// Assert
			expect(tokenService.verifyAccessToken).toHaveBeenCalledWith("validToken");
			expect(res.json).toHaveBeenCalledWith({
				authenticated: true,
				email: "user@example.com",
			});
		});

		it("should return unauthenticated false and email undefined when no tokens", async () => {
			// No session or refresh token
			AuthController.status(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				authenticated: false,
				email: undefined,
			});
		});

		it("should return authenticated true and email when refresh token is valid", async () => {
			// Session invalid, refresh valid
			req.cookies = { refresh_token: "refreshToken" };
			vi.spyOn(tokenService, "verifyAccessToken").mockRejectedValue(
				new Error(),
			);
			vi.spyOn(tokenService, "rotateAuthTokens").mockResolvedValue({
				user: { email: "user@example.com" },
				newRefreshToken: "newToken",
			} as RotateAuthReturn);
			AuthController.status(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(tokenService.rotateAuthTokens).toHaveBeenCalledWith(
				"refreshToken",
				res as Response,
			);
			expect(res.json).toHaveBeenCalledWith({
				authenticated: true,
				email: "user@example.com",
			});
		});

		it("should return unauthenticated false and email undefined when both session and refresh tokens invalid", async () => {
			// Both tokens invalid
			req.cookies = { refresh_token: "refreshToken" };
			vi.spyOn(tokenService, "verifyAccessToken").mockRejectedValue(
				new Error(),
			);
			vi.spyOn(tokenService, "rotateAuthTokens").mockRejectedValue(new Error());
			AuthController.status(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(tokenService.rotateAuthTokens).toHaveBeenCalledWith(
				"refreshToken",
				res as Response,
			);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				authenticated: false,
				email: undefined,
			});
		});
	});
});
