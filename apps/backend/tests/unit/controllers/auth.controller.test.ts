import type { Request, Response } from "express";
import { authTypes } from "shared/auth-types";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import AuthController from "../../../src/controllers/auth.controller";
import User from "../../../src/models/user.model";
import StatusCodes from "../../../src/utils/response-codes";
import * as tokenService from "../../../src/utils/token-service";
import { stytchClient } from "../../../src/config/stytch";
// Stub stytchClient to avoid config environment check
vi.mock("../../../src/config/stytch", () => ({
	stytchClient: {
		magicLinks: {
			email: { loginOrCreate: vi.fn().mockResolvedValue({}) },
			authenticate: vi.fn().mockResolvedValue({
				user: { emails: [{ email: "user@example.com" }] },
			}),
		},
		passwords: {
			create: vi.fn(),
		},
	},
}));
// Mock token-service to stub auth flows
vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
	rotateAuthTokens: vi.fn(),
	issueAuthTokens: vi.fn(),
}));
// Mock User model
vi.mock("../../../src/models/user.model", () => ({
	default: { findOne: vi.fn(), create: vi.fn() },
}));

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

	describe("signUp", () => {
		let req: Partial<Request> & { body?: Record<string, unknown> };
		let res: Partial<Response> & { status: Mock; json: Mock };

		beforeEach(() => {
			req = { body: {} };
			res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
			vi.clearAllMocks();
		});

		it("should return 400 if request body fails validation", async () => {
			AuthController.signUp(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		it("should return 400 for unsupported auth type", async () => {
			req.body = { type: authTypes.magicLink, email: "test@example.com" };
			AuthController.signUp(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unsupported auth type",
			});
		});

		it("should return 400 when password is missing for passwordLogin", async () => {
			req.body = { type: authTypes.passwordLogin, email: "test@example.com" };
			AuthController.signUp(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Password is required",
			});
		});

		it("should create new user on success and return authenticated true", async () => {
			req.body = {
				type: authTypes.passwordLogin,
				email: "new@example.com",
				password: "Password1!",
			};
			(stytchClient.passwords.create as Mock).mockResolvedValue({
				user: { emails: [{ email: "new@example.com" }] },
			});
			(User.findOne as Mock).mockResolvedValue(null);
			(User.create as Mock).mockResolvedValue({
				_id: "id1",
				email: "new@example.com",
			});
			(tokenService.issueAuthTokens as Mock).mockResolvedValue(undefined);

			AuthController.signUp(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));

			expect(stytchClient.passwords.create).toHaveBeenCalledWith({
				email: "new@example.com",
				password: "Password1!",
			});
			expect(User.findOne).toHaveBeenCalledWith({ email: "new@example.com" });
			expect(User.create).toHaveBeenCalledWith({ email: "new@example.com" });
			expect(tokenService.issueAuthTokens).toHaveBeenCalledWith(
				res as Response,
				"new@example.com",
				"id1",
			);
			expect(res.json).toHaveBeenCalledWith({
				authenticated: true,
				email: "new@example.com",
			});
		});

		it("should use existing user on success and return authenticated true", async () => {
			req.body = {
				type: authTypes.passwordLogin,
				email: "existing@example.com",
				password: "Password1!",
			};
			(stytchClient.passwords.create as Mock).mockResolvedValue({
				user: { emails: [{ email: "existing@example.com" }] },
			});
			const existingUser = { _id: "u1", email: "existing@example.com" };
			(User.findOne as Mock).mockResolvedValue(existingUser);
			(tokenService.issueAuthTokens as Mock).mockResolvedValue(undefined);

			AuthController.signUp(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));

			expect(User.create).not.toHaveBeenCalled();
			expect(tokenService.issueAuthTokens).toHaveBeenCalledWith(
				res as Response,
				"existing@example.com",
				"u1",
			);
			expect(res.json).toHaveBeenCalledWith({
				authenticated: true,
				email: "existing@example.com",
			});
		});
	});
});
