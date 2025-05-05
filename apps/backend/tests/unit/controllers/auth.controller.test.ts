// Unit tests for AuthController
// Uses Vitest and mocks dependencies to test all authentication, signup, login, logout, and status flows
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

// Mock stytchClient to control all Stytch authentication flows
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

// Mock token service to control token verification and issuance
vi.mock("../../../src/utils/token-service", () => ({
	verifyAccessToken: vi.fn(),
	rotateAuthTokens: vi.fn(),
	issueAuthTokens: vi.fn(),
	deleteAuthToken: vi.fn(),
	deleteAllAuthTokens: vi.fn(),
}));

// Mock user model to control DB operations
vi.mock("../../../src/models/user.model", () => ({
	default: { findOne: vi.fn(), create: vi.fn(), findOneAndUpdate: vi.fn() },
}));

// Mock encrypt utility for API key encryption
vi.mock("../../../src/utils/encrypt-string", () => ({
	encrypt: vi.fn(),
}));

type VerifyAccessReturn = Awaited<
	ReturnType<typeof tokenService.verifyAccessToken>
>;

type RotateAuthReturn = Awaited<
	ReturnType<typeof tokenService.rotateAuthTokens>
>;

// Main test suite for AuthController
// Covers signUp, login, resetPassword, authenticate, logout, logoutAll, changeTrial, and status methods

describe("AuthController", () => {
	// Test signUp method
	describe("signUp", () => {
		let req: Partial<Request> & { body?: Record<string, unknown> };
		let res: Partial<Response> & { status: Mock; json: Mock };

		beforeEach(() => {
			req = { body: {} };
			res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
			vi.clearAllMocks();
		});

		// Should return 400 if request body fails validation
		it("should return 400 if request body fails validation", async () => {
			// Test case to verify that the signUp method returns a 400 error when the request body fails validation
			AuthController.signUp(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		// Should return 400 for unsupported auth type
		it("should return 400 for unsupported auth type", async () => {
			// Test case to verify that the signUp method returns a 400 error when an unsupported auth type is provided
			req.body = { type: authTypes.magicLink, email: "test@example.com" };
			AuthController.signUp(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unsupported auth type",
			});
		});

		// Should return 400 when password is missing for passwordLogin
		it("should return 400 when password is missing for passwordLogin", async () => {
			// Test case to verify that the signUp method returns a 400 error when the password is missing for passwordLogin
			req.body = { type: authTypes.passwordLogin, email: "test@example.com" };
			AuthController.signUp(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Password is required",
			});
		});

		// Should create new user on success and return authenticated true
		it("should create new user on success and return authenticated true", async () => {
			// Test case to verify that the signUp method creates a new user and returns authenticated true on success
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

		// Should use existing user on success and return authenticated true
		it("should use existing user on success and return authenticated true", async () => {
			// Test case to verify that the signUp method uses an existing user and returns authenticated true on success
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

		// Should return 400 and message if StytchError with email_duplicate is thrown
		it("should return 400 and message if StytchError with email_duplicate is thrown", async () => {
			// Test case to verify that the signUp method returns a 400 error and a message when a StytchError with email_duplicate is thrown
			req.body = {
				type: authTypes.passwordLogin,
				email: "new@example.com",
				password: "Password1!",
			};
			const stytchError = new StytchError({
				error_type: "duplicate_email",
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

		// Should return 400 and message if StytchError with invalid_email is thrown
		it("should return 400 and message if StytchError with invalid_email is thrown", async () => {
			// Test case to verify that the signUp method returns a 400 error and a message when a StytchError with invalid_email is thrown
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

	// Test login method
	describe("login", () => {
		let req: Partial<Request> & { body?: Record<string, unknown> };
		let res: Partial<Response> & { status: Mock; json: Mock };

		beforeEach(() => {
			req = { body: {} };
			res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
			vi.clearAllMocks();
		});

		// Should return 400 if request body fails validation
		it("should return 400 if request body fails validation", async () => {
			// Test case to verify that the login method returns a 400 error when the request body fails validation
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
		});

		// Should return 400 and message on invalid auth type
		it("should return 400 and message on invalid auth type", async () => {
			// Test case to verify that the login method returns a 400 error and a message when an invalid auth type is provided
			req.body = { email: "test@example.com", type: "reset_password" };
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unsupported auth type",
			});
		});

		// Should send magic link on magicLink type (success)
		it("should send magic link on magicLink type (success)", async () => {
			// Test case to verify that the login method sends a magic link on success when the magicLink type is provided
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

		// Should handle error from magic link login
		it("should handle error from magic link login", async () => {
			// Test case to verify that the login method handles errors from the magic link login
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

		// Should return 400 if password is missing for passwordLogin
		it("should return 400 if password is missing for passwordLogin", async () => {
			// Test case to verify that the login method returns a 400 error when the password is missing for passwordLogin
			req.body = { email: "test@example.com", type: authTypes.passwordLogin };
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: "Password is required",
			});
		});

		// Should authenticate and create new user on passwordLogin (user not found)
		it("should authenticate and create new user on passwordLogin (user not found)", async () => {
			// Test case to verify that the login method authenticates and creates a new user on success when the passwordLogin type is provided and the user is not found
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

		// Should authenticate and use existing user on passwordLogin
		it("should authenticate and use existing user on passwordLogin", async () => {
			// Test case to verify that the login method authenticates and uses an existing user on success when the passwordLogin type is provided
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

		// Should handle error from password login authenticate
		it("should handle error from password login authenticate", async () => {
			// Test case to verify that the login method handles errors from the password login authenticate
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

		// Should return 400 for unsupported auth type
		it("should return 400 for unsupported auth type", async () => {
			// Test case to verify that the login method returns a 400 error when an unsupported auth type is provided
			req.body = { email: "test@example.com", type: "invalidType" };
			AuthController.login(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({
				message: expect.stringContaining("Invalid enum value"),
			});
		});
	});

	// Test resetPassword method
	describe("resetPassword", () => {
		let req: Partial<Request> & { body?: Record<string, unknown> };
		let res: Partial<Response> & { status: Mock; json: Mock };

		beforeEach(() => {
			req = { body: {} };
			res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
			vi.clearAllMocks();
		});

		// Should send password reset link on valid email
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

		// Should return 400 if request body fails validation
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

	// Test authenticate method
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

		// Should authenticate with magic link and create new user
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

		// Should authenticate with magic link and use existing user
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

		// Should return 400 if token is missing for magic link
		it("should return 400 if token is missing for magic link", async () => {
			req.query = { stytch_token_type: authTypes.magicLink };
			AuthController.authenticate(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: "Token is required" });
		});

		// Should handle error from stytch magic link authenticate
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

		// Should reset password with valid token and body
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

		// Should return 400 if password reset body fails validation
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

		// Should handle error from stytch password reset
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

		// Should return 400 for unsupported token type
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

	// Test logout method
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

		// Should logout and clear cookies with valid tokens
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

		// Should use newRefreshToken if tokenRotated is true
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

		// Should return 401 if no refresh token
		it("should return 401 if no refresh token", () => {
			AuthController.logout(req as Request, res as Response);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		// Should return 401 if no user._id
		it("should return 401 if no user._id", () => {
			req.cookies = { refresh_token: "refreshToken" };
			AuthController.logout(req as Request, res as Response);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		// Should return 500 if deleteAuthToken fails
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

	// Tests for logoutAll method
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

		// Should logout from all sessions and clear cookies with valid user
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

		// Should return 401 if no user._id
		it("should return 401 if no user._id", () => {
			AuthController.logoutAll(req as Request, res as Response);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				message: StatusCodes.UNAUTHORIZED.message,
			});
		});

		// Should return 500 if deleteAllAuthTokens fails
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

	// Tests for changeTrial method
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

		// Should update API key and set freeTrial to false
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

		// Should return 400 if api_key is missing
		it("should return 400 if api_key is missing", () => {
			req.body = {};
			AuthController.changeTrial(req as Request, res as Response);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST.code);
			expect(res.json).toHaveBeenCalledWith({ message: "API key is required" });
		});

		// Should return 404 if user not found
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

		// Should return 500 if encrypt or findOneAndUpdate fails
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

	// Tests for status method
	describe("status", () => {
		let req: Partial<Request>;
		let res: Partial<Response> & { status: Mock; json: Mock };

		beforeEach(() => {
			req = { cookies: {} };
			res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
		});

		// Should return authenticated true and email when session token is valid
		it("should return authenticated true and email when session token is valid", async () => {
			req.cookies = { session_token: "validToken" };
			vi.spyOn(tokenService, "verifyAccessToken").mockResolvedValue({
				email: "user@example.com",
			} as VerifyAccessReturn);

			AuthController.status(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));

			expect(tokenService.verifyAccessToken).toHaveBeenCalledWith("validToken");
			expect(res.json).toHaveBeenCalledWith({
				authenticated: true,
				email: "user@example.com",
			});
		});

		// Should return unauthenticated false and email undefined when no tokens
		it("should return unauthenticated false and email undefined when no tokens", async () => {
			AuthController.status(req as Request, res as Response);
			await new Promise((r) => setImmediate(r));
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED.code);
			expect(res.json).toHaveBeenCalledWith({
				authenticated: false,
				email: undefined,
			});
		});

		// Should return authenticated true and email when refresh token is valid
		it("should return authenticated true and email when refresh token is valid", async () => {
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

		// Should return unauthenticated false and email undefined when both session and refresh tokens invalid
		it("should return unauthenticated false and email undefined when both session and refresh tokens invalid", async () => {
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

		// Should return 401 and unauthenticated if tokenService.verifyAccessToken rejects
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
