import type { NextFunction, Request, Response } from "express";
import type { Document } from "mongoose";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import authMiddleware from "../../../src/middlewares/auth";
import { UnauthorizedError } from "../../../src/utils/errors";
import ResponseStatus from "../../../src/utils/response-codes";
import * as tokenService from "../../../src/utils/token-service";

// Test suite for the authentication middleware
// Covers all major code paths for session and refresh token validation

describe("auth middleware", () => {
	// Mocks for Express request, response, and next function
	let req: Partial<
		Request & {
			user?: Partial<Document>;
			tokenRotated?: boolean;
			newRefreshToken?: string;
		}
	>;
	let res: Partial<Response> & {
		status: Mock;
		json: Mock;
		cookies?: Record<string, unknown>;
	};
	let next: NextFunction;

	// Setup mocks and request/response objects before each test
	beforeEach(() => {
		req = { cookies: {} };
		res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
		next = vi.fn();
		vi.clearAllMocks();
	});

	// Test case: Valid session token
	it("should call next and set req.user if session token is valid", async () => {
		// Simulate a valid session token in cookies
		req.cookies = { session_token: "validToken" };
		const user: Partial<Document> = {
			toObject: () => ({ email: "user@example.com" }),
			_id: { toString: () => "u1" },
		};
		// Mock verifyAccessToken to resolve with a user object
		// biome-ignore lint/suspicious/noExplicitAny: ignore to pass type check of mongoose
		vi.spyOn(tokenService, "verifyAccessToken").mockResolvedValue(user as any);

		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should validate the session token and set req.user
		expect(tokenService.verifyAccessToken).toHaveBeenCalledWith("validToken");
		expect(req.user).toEqual({ email: "user@example.com", _id: "u1" });
		expect(next).toHaveBeenCalled();
	});

	// Test case: Invalid session token, valid refresh token
	it("should process refresh if session token is invalid and refresh is valid", async () => {
		// Simulate invalid session token and valid refresh token
		req.cookies = { session_token: "bad", refresh_token: "refreshToken" };
		vi.spyOn(tokenService, "verifyAccessToken").mockRejectedValue(new Error());
		const user: Partial<Document> = {
			toObject: () => ({ email: "user@example.com" }),
			_id: { toString: () => "u1" },
		};
		// Mock rotateAuthTokens to resolve with user and new refresh token
		vi.spyOn(tokenService, "rotateAuthTokens").mockResolvedValue({
			// biome-ignore lint/suspicious/noExplicitAny: ignore to pass type check of mongoose
			user: user as any,
			newRefreshToken: "newRefresh",
		});

		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should call rotateAuthTokens and update req fields
		expect(tokenService.rotateAuthTokens).toHaveBeenCalledWith(
			"refreshToken",
			res as Response,
		);
		expect(req.user).toEqual({ email: "user@example.com", _id: "u1" });
		expect(req.tokenRotated).toBe(true);
		expect(req.newRefreshToken).toBe("newRefresh");
		expect(next).toHaveBeenCalled();
	});

	// Test case: No session token, valid refresh token
	it("should process refresh if no session token and refresh is valid", async () => {
		// Simulate only refresh token present
		req.cookies = { refresh_token: "refreshToken" };
		const user: Partial<Document> = {
			toObject: () => ({ email: "user@example.com" }),
			_id: { toString: () => "u1" },
		};
		// Mock rotateAuthTokens to resolve with user and new refresh token
		vi.spyOn(tokenService, "rotateAuthTokens").mockResolvedValue({
			// biome-ignore lint/suspicious/noExplicitAny: ignore to pass type check of mongoose
			user: user as any,
			newRefreshToken: "newRefresh",
		});

		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should call rotateAuthTokens and update req fields
		expect(tokenService.rotateAuthTokens).toHaveBeenCalledWith(
			"refreshToken",
			res as Response,
		);
		expect(req.user).toEqual({ email: "user@example.com", _id: "u1" });
		expect(req.tokenRotated).toBe(true);
		expect(req.newRefreshToken).toBe("newRefresh");
		expect(next).toHaveBeenCalled();
	});

	// Test case: No session token, no refresh token
	it("should return 401 if no refresh token and no session token", async () => {
		// Simulate missing both session and refresh tokens
		req.cookies = {};
		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should respond with 401 Unauthorized
		expect(res.status).toHaveBeenCalledWith(ResponseStatus.UNAUTHORIZED.code);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.UNAUTHORIZED.message,
		});
		expect(next).not.toHaveBeenCalled();
	});

	// Test case: Invalid refresh token (UnauthorizedError)
	it("should return 401 if refresh token is invalid (UnauthorizedError)", async () => {
		// Simulate invalid refresh token
		req.cookies = { refresh_token: "refreshToken" };
		vi.spyOn(tokenService, "rotateAuthTokens").mockRejectedValue(
			new UnauthorizedError("Unauthorized"),
		);
		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should respond with 401 Unauthorized
		expect(res.status).toHaveBeenCalledWith(ResponseStatus.UNAUTHORIZED.code);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.UNAUTHORIZED.message,
		});
		expect(next).not.toHaveBeenCalled();
	});

	// Test case: Unexpected error in rotateAuthTokens
	it("should return 500 if rotateAuthTokens throws non-UnauthorizedError", async () => {
		// Simulate unexpected error in rotateAuthTokens
		req.cookies = { refresh_token: "refreshToken" };
		vi.spyOn(tokenService, "rotateAuthTokens").mockRejectedValue(
			new Error("fail"),
		);
		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		// Should respond with 500 Internal Server Error
		expect(res.status).toHaveBeenCalledWith(
			ResponseStatus.INTERNAL_SERVER_ERROR.code,
		);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
		});
		expect(next).not.toHaveBeenCalled();
	});
});
