import type { Request, Response } from "express";
import { authTypes } from "shared/auth-types";
import { StytchError } from "stytch";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { stytchClient } from "../../../src/config/stytch";
import AuthController from "../../../src/controllers/auth.controller";
import User from "../../../src/models/user.model";
import { encrypt } from "../../../src/utils/encrypt-string";
import StatusCodes from "../../../src/utils/response-codes";
import * as tokenService from "../../../src/utils/token-service";
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
			authenticate: vi.fn(),
			email: {
				reset: vi.fn(),
				resetStart: vi.fn(),
			},
		},
	},
}));
// Mock token-service to stub auth flows
vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
	rotateAuthTokens: vi.fn(),
	issueAuthTokens: vi.fn(),
	deleteAuthToken: vi.fn(),
	deleteAllAuthTokens: vi.fn(),
}));
// Mock User model
vi.mock("../../../src/models/user.model", () => ({
	default: { findOne: vi.fn(), create: vi.fn(), findOneAndUpdate: vi.fn() },
}));
// Mock encrypt
vi.mock("../../../src/utils/encrypt-string", () => ({
	encrypt: vi.fn(),
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

		it("should return 400 and message if StytchError with email_duplicate is thrown", async () => {
			req.body = {
				type: authTypes.passwordLogin,
				email: "new@example.com",
				password: "Password1!",
			};
			const stytchError = new StytchError({
				error_type: "email_duplicate",
				error_message: "Email already exists",
				status_code: 400,
				request_id: "mock-request-id",
				error_url: "https://example.com/error",
			});
			(stytchClient.passwords.create as Mock).mockRejectedValue(stytchError);
			AuthController.signUp(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message:
					"Email already exists. Please use a different email or change your password.",
			});
		});

		it("should return 400 and message if StytchError with invalid_email is thrown", async () => {
			req.body = {
				type: authTypes.passwordLogin,
				email: "new@example.com",
				password: "Password1!",
			};
			const stytchError = new StytchError({
				error_type: "invalid_email",
				error_message: "Invalid email",
				status_code: 400,
				request_id: "mock-request-id",
				error_url: "https://example.com/error",
			});
			(stytchClient.passwords.create as Mock).mockRejectedValue(stytchError);
			AuthController.signUp(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Invalid email",
			});
		});
	});

	describe("login", () => {
		let req: Partial<Request> & { body?: Record<string, unknown> };
		let res: Partial<Response> & { status: Mock; json: Mock };

		beforeEach(() => {
			req = { body: {} };
			res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
			vi.clearAllMocks();
		});

		it("should return 400 if request body fails validation", async () => {
			// Zod validation fails (missing email/type)
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		it("should return 400 and message on invalid auth type", async () => {
			req.body = { email: "test@example.com", type: "reset_password" };
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unsupported auth type",
			});
		});

		it("should send magic link on magicLink type (success)", async () => {
			req.body = { email: "test@example.com", type: authTypes.magicLink };
			const mockLogin = stytchClient.magicLinks.email.loginOrCreate as Mock;
			mockLogin.mockResolvedValue({});
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(mockLogin).toHaveBeenCalledWith({ email: "test@example.com" });
			expect(res.json).toHaveBeenCalledWith({
				message: "Magic link sent successfully",
			});
		});

		it("should handle error from magic link login", async () => {
			req.body = { email: "fail@example.com", type: authTypes.magicLink };
			const mockLogin = stytchClient.magicLinks.email.loginOrCreate as Mock;
			const error = new StytchError({
				error_type: "request_invalid",
				error_message: "stytch error",
				status_code: 400,
				request_id: "mock-request-id",
				error_url: "https://example.com/error",
			});
			mockLogin.mockRejectedValue(error);
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		it("should return 400 if password is missing for passwordLogin", async () => {
			req.body = { email: "test@example.com", type: authTypes.passwordLogin };
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Password is required",
			});
		});

		it("should authenticate and create new user on passwordLogin (user not found)", async () => {
			req.body = {
				email: "new@example.com",
				type: authTypes.passwordLogin,
				password: "Password1!",
			};
			const mockAuth = stytchClient.passwords.authenticate as Mock;
			mockAuth.mockResolvedValue({
				user: { emails: [{ email: "new@example.com" }] },
			});
			(User.findOne as Mock).mockResolvedValue(null);
			(User.create as Mock).mockResolvedValue({
				_id: "id1",
				email: "new@example.com",
			});
			(tokenService.issueAuthTokens as Mock).mockResolvedValue(undefined);
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(mockAuth).toHaveBeenCalledWith({
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

		it("should authenticate and use existing user on passwordLogin", async () => {
			req.body = {
				email: "existing@example.com",
				type: authTypes.passwordLogin,
				password: "Password1!",
			};
			const mockAuth = stytchClient.passwords.authenticate as Mock;
			mockAuth.mockResolvedValue({
				user: { emails: [{ email: "existing@example.com" }] },
			});
			const existingUser = { _id: "u1", email: "existing@example.com" };
			(User.findOne as Mock).mockResolvedValue(existingUser);
			(tokenService.issueAuthTokens as Mock).mockResolvedValue(undefined);
			AuthController.login(req as Request, res as Response);
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

		it("should handle error from password login authenticate", async () => {
			req.body = {
				email: "fail@example.com",
				type: authTypes.passwordLogin,
				password: "Password1!",
			};
			const mockAuth = stytchClient.passwords.authenticate as Mock;
			const error = new StytchError({
				error_type: "request_invalid",
				error_message: "stytch error",
				status_code: 400,
				request_id: "mock-request-id",
				error_url: "https://example.com/error",
			});
			mockAuth.mockRejectedValue(error);
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		it("should return 400 for unsupported auth type", async () => {
			req.body = { email: "test@example.com", type: "invalidType" };
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: expect.stringContaining("Invalid enum value"),
			});
		});
	});

	describe("resetPassword", () => {
		let req: Partial<Request> & { body?: Record<string, unknown> };
		let res: Partial<Response> & { status: Mock; json: Mock };

		beforeEach(() => {
			req = { body: {} };
			res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
			vi.clearAllMocks();
		});

		it("should send password reset link on valid email", async () => {
			req.body = { email: "user@example.com" };
			(stytchClient.passwords.email.resetStart as Mock).mockResolvedValue({});

			AuthController.resetPassword(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(stytchClient.passwords.email.resetStart).toHaveBeenCalledWith({
				email: "user@example.com",
			});
			expect(res.json).toHaveBeenCalledWith({
				message: "Password reset link sent successfully",
			});
		});

		it("should return 400 if request body fails validation", async () => {
			req.body = { email: "" };
			AuthController.resetPassword(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		it("should handle error from stytch resetStart", async () => {
			req.body = { email: "user@example.com" };
			const error = new StytchError({
				error_type: "request_invalid",
				error_message: "stytch error",
				status_code: 400,
				request_id: "mock-request-id",
				error_url: "https://example.com/error",
			});
			(stytchClient.passwords.email.resetStart as Mock).mockRejectedValue(
				error,
			);
			AuthController.resetPassword(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: "stytch error" });
		});
	});

	describe("authenticate", () => {
		let req: Partial<
			Request & {
				body?: Record<string, unknown>;
				query?: Record<string, unknown>;
			}
		>;
		let res: Partial<Response> & { status: Mock; json: Mock };

		beforeEach(() => {
			req = { body: {}, query: {} };
			res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
			vi.clearAllMocks();
		});

		it("should authenticate with magic link and create new user", async () => {
			req.query = {
				token: "magic-token",
				stytch_token_type: authTypes.magicLink,
			};
			(stytchClient.magicLinks.authenticate as Mock).mockResolvedValue({
				user: { emails: [{ email: "new@example.com" }] },
			});
			(User.findOne as Mock).mockResolvedValue(null);
			(User.create as Mock).mockResolvedValue({
				_id: "id1",
				email: "new@example.com",
			});
			(tokenService.issueAuthTokens as Mock).mockResolvedValue(undefined);

			AuthController.authenticate(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(stytchClient.magicLinks.authenticate).toHaveBeenCalledWith({
				token: "magic-token",
				session_duration_minutes: 60,
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

		it("should authenticate with magic link and use existing user", async () => {
			req.query = {
				token: "magic-token",
				stytch_token_type: authTypes.magicLink,
			};
			(stytchClient.magicLinks.authenticate as Mock).mockResolvedValue({
				user: { emails: [{ email: "existing@example.com" }] },
			});
			const existingUser = { _id: "u1", email: "existing@example.com" };
			(User.findOne as Mock).mockResolvedValue(existingUser);
			(tokenService.issueAuthTokens as Mock).mockResolvedValue(undefined);

			AuthController.authenticate(req as Request, res as Response);
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

		it("should return 400 if token is missing for magic link", async () => {
			req.query = { stytch_token_type: authTypes.magicLink };
			AuthController.authenticate(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: "Token is required" });
		});

		it("should handle error from stytch magic link authenticate", async () => {
			req.query = {
				token: "magic-token",
				stytch_token_type: authTypes.magicLink,
			};
			const error = new StytchError({
				error_type: "request_invalid",
				error_message: "stytch error",
				status_code: 400,
				request_id: "mock-request-id",
				error_url: "https://example.com/error",
			});
			(stytchClient.magicLinks.authenticate as Mock).mockRejectedValue(error);
			AuthController.authenticate(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: "stytch error" });
		});

		it("should reset password with valid token and body", async () => {
			req.query = {
				token: "reset-token",
				stytch_token_type: authTypes.passwordReset,
			};
			req.body = { password: "Password1!" };
			(stytchClient.passwords.email.reset as Mock).mockResolvedValue({});

			AuthController.authenticate(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(stytchClient.passwords.email.reset).toHaveBeenCalledWith({
				token: "reset-token",
				password: "Password1!",
			});
			expect(res.json).toHaveBeenCalledWith({
				message: "Password reset successfully",
			});
		});

		it("should return 400 if password reset body fails validation", async () => {
			req.query = {
				token: "reset-token",
				stytch_token_type: authTypes.passwordReset,
			};
			req.body = { password: "" };
			AuthController.authenticate(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		it("should handle error from stytch password reset", async () => {
			req.query = {
				token: "reset-token",
				stytch_token_type: authTypes.passwordReset,
			};
			req.body = { password: "Password1!" };
			const error = new StytchError({
				error_type: "request_invalid",
				error_message: "stytch error",
				status_code: 400,
				request_id: "mock-request-id",
				error_url: "https://example.com/error",
			});
			(stytchClient.passwords.email.reset as Mock).mockRejectedValue(error);
			AuthController.authenticate(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: "stytch error" });
		});

		it("should return 400 for unsupported token type", async () => {
			req.query = { token: "some-token", stytch_token_type: "unsupported" };
			AuthController.authenticate(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unsupported token type",
			});
		});
	});

	describe("logout", () => {
		let req: Partial<
			Request & {
				tokenRotated?: boolean;
				newRefreshToken?: string;
				user?: { _id?: string };
			}
		>;
		let res: Partial<Response> & {
			status: Mock;
			json: Mock;
			clearCookie: Mock;
		};

		beforeEach(() => {
			req = { cookies: {} };
			res = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn(),
				clearCookie: vi.fn().mockReturnThis(),
			};
			vi.clearAllMocks();
		});

		it("should logout and clear cookies with valid tokens", async () => {
			req.cookies = { refresh_token: "refreshToken" };
			req.user = { _id: "u1" };
			(tokenService.deleteAuthToken as Mock).mockResolvedValue(undefined);

			AuthController.logout(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(tokenService.deleteAuthToken).toHaveBeenCalledWith(
				"u1",
				"refreshToken",
			);
			expect(res.clearCookie).toHaveBeenCalledWith("session_token");
			expect(res.clearCookie).toHaveBeenCalledWith("refresh_token");
			expect(res.json).toHaveBeenCalledWith({
				message: "Logged out successfully",
			});
		});

		it("should use newRefreshToken if tokenRotated is true", async () => {
			req.tokenRotated = true;
			req.newRefreshToken = "rotatedToken";
			req.user = { _id: "u1" };
			(tokenService.deleteAuthToken as Mock).mockResolvedValue(undefined);

			AuthController.logout(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(tokenService.deleteAuthToken).toHaveBeenCalledWith(
				"u1",
				"rotatedToken",
			);
		});

		it("should return 401 if no refresh token", () => {
			AuthController.logout(req as Request, res as Response);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		it("should return 401 if no user._id", () => {
			req.cookies = { refresh_token: "refreshToken" };
			AuthController.logout(req as Request, res as Response);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		it("should return 500 if deleteAuthToken fails", async () => {
			req.cookies = { refresh_token: "refreshToken" };
			req.user = { _id: "u1" };
			(tokenService.deleteAuthToken as Mock).mockRejectedValue(
				new Error("fail"),
			);

			AuthController.logout(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(
				StatusCodes.INTERNAL_SERVER_ERROR.code,
			);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.INTERNAL_SERVER_ERROR.message,
			});
		});
	});

	describe("logoutAll", () => {
		let req: Partial<Request & { user?: { _id?: string } }>;
		let res: Partial<Response> & {
			status: Mock;
			json: Mock;
			clearCookie: Mock;
		};

		beforeEach(() => {
			req = {};
			res = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn(),
				clearCookie: vi.fn().mockReturnThis(),
			};
			vi.clearAllMocks();
		});

		it("should logout from all sessions and clear cookies with valid user", async () => {
			req.user = { _id: "u1" };
			(tokenService.deleteAllAuthTokens as Mock).mockResolvedValue(undefined);

			AuthController.logoutAll(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(tokenService.deleteAllAuthTokens).toHaveBeenCalledWith("u1");
			expect(res.clearCookie).toHaveBeenCalledWith("session_token");
			expect(res.clearCookie).toHaveBeenCalledWith("refresh_token");
			expect(res.json).toHaveBeenCalledWith({
				message: "Logged out from all sessions",
			});
		});

		it("should return 401 if no user._id", () => {
			AuthController.logoutAll(req as Request, res as Response);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		it("should return 500 if deleteAllAuthTokens fails", async () => {
			req.user = { _id: "u1" };
			(tokenService.deleteAllAuthTokens as Mock).mockRejectedValue(
				new Error("fail"),
			);

			AuthController.logoutAll(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(
				StatusCodes.INTERNAL_SERVER_ERROR.code,
			);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.INTERNAL_SERVER_ERROR.message,
			});
		});
	});

	describe("changeTrial", () => {
		let req: Partial<Request & { user?: { _id?: string } }> & {
			body?: Record<string, unknown>;
		};
		let res: Partial<Response> & { status: Mock; json: Mock };

		beforeEach(() => {
			req = { body: {}, user: { _id: "u1" } };
			res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
			vi.clearAllMocks();
		});

		it("should update API key and set freeTrial to false", async () => {
			req.body = { api_key: "myKey" };
			const encrypted = "encrypted";
			vi.mocked(encrypt).mockResolvedValue(encrypted);
			(User.findOneAndUpdate as Mock).mockResolvedValue({
				_id: "u1",
				email: "user@example.com",
			});

			AuthController.changeTrial(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(vi.mocked(encrypt)).toHaveBeenCalledWith("myKey");
			expect(User.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: "u1" },
				{ api_key: encrypted, freeTrial: false },
				{ new: true },
			);
			expect(res.json).toHaveBeenCalledWith({
				message: "API key updated successfully",
			});
		});

		it("should return 400 if api_key is missing", () => {
			req.body = {};
			AuthController.changeTrial(req as Request, res as Response);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: "API key is required" });
		});

		it("should return 404 if user not found", async () => {
			req.body = { api_key: "myKey" };
			const encrypted = "encrypted";
			vi.mocked(encrypt).mockResolvedValue(encrypted);
			(User.findOneAndUpdate as Mock).mockResolvedValue(null);

			AuthController.changeTrial(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND.code);
			expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
		});

		it("should return 500 if encrypt or findOneAndUpdate fails", async () => {
			req.body = { api_key: "myKey" };
			vi.mocked(encrypt).mockRejectedValue(new Error("fail"));

			AuthController.changeTrial(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(
				StatusCodes.INTERNAL_SERVER_ERROR.code,
			);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.INTERNAL_SERVER_ERROR.message,
			});
		});
	});

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

		it("should return 401 and unauthenticated if tokenService.verifyAccessToken rejects", async () => {
			req.cookies = { session_token: "badToken" };
			vi.spyOn(tokenService, "verifyAccessToken").mockRejectedValue(
				new Error("fail"),
			);
			AuthController.status(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				authenticated: false,
				email: undefined,
			});
		});
	});
});
