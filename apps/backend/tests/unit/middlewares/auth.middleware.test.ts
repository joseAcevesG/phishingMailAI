import type { NextFunction, Request, Response } from "express";
import type { Document } from "mongoose";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import authMiddleware from "../../../src/middlewares/auth";
import { UnauthorizedError } from "../../../src/utils/errors";
import ResponseStatus from "../../../src/utils/response-codes";
import * as tokenService from "../../../src/utils/token-service";

describe("auth middleware", () => {
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

	beforeEach(() => {
		req = { cookies: {} };
		res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
		next = vi.fn();
		vi.clearAllMocks();
	});

	it("should call next and set req.user if session token is valid", async () => {
		req.cookies = { session_token: "validToken" };
		const user: Partial<Document> = {
			toObject: () => ({ email: "user@example.com" }),
			_id: { toString: () => "u1" },
		};
		// biome-ignore lint/suspicious/noExplicitAny: ignore to pass type check of mongoose
		vi.spyOn(tokenService, "verifyAccessToken").mockResolvedValue(user as any);

		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		expect(tokenService.verifyAccessToken).toHaveBeenCalledWith("validToken");
		expect(req.user).toEqual({ email: "user@example.com", _id: "u1" });
		expect(next).toHaveBeenCalled();
	});

	it("should process refresh if session token is invalid and refresh is valid", async () => {
		req.cookies = { session_token: "bad", refresh_token: "refreshToken" };
		vi.spyOn(tokenService, "verifyAccessToken").mockRejectedValue(new Error());
		const user: Partial<Document> = {
			toObject: () => ({ email: "user@example.com" }),
			_id: { toString: () => "u1" },
		};
		vi.spyOn(tokenService, "rotateAuthTokens").mockResolvedValue({
			// biome-ignore lint/suspicious/noExplicitAny: ignore to pass type check of mongoose
			user: user as any,
			newRefreshToken: "newRefresh",
		});

		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		expect(tokenService.rotateAuthTokens).toHaveBeenCalledWith(
			"refreshToken",
			res as Response,
		);
		expect(req.user).toEqual({ email: "user@example.com", _id: "u1" });
		expect(req.tokenRotated).toBe(true);
		expect(req.newRefreshToken).toBe("newRefresh");
		expect(next).toHaveBeenCalled();
	});

	it("should process refresh if no session token and refresh is valid", async () => {
		req.cookies = { refresh_token: "refreshToken" };
		const user: Partial<Document> = {
			toObject: () => ({ email: "user@example.com" }),
			_id: { toString: () => "u1" },
		};
		vi.spyOn(tokenService, "rotateAuthTokens").mockResolvedValue({
			// biome-ignore lint/suspicious/noExplicitAny: ignore to pass type check of mongoose
			user: user as any,
			newRefreshToken: "newRefresh",
		});

		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		expect(tokenService.rotateAuthTokens).toHaveBeenCalledWith(
			"refreshToken",
			res as Response,
		);
		expect(req.user).toEqual({ email: "user@example.com", _id: "u1" });
		expect(req.tokenRotated).toBe(true);
		expect(req.newRefreshToken).toBe("newRefresh");
		expect(next).toHaveBeenCalled();
	});

	it("should return 401 if no refresh token and no session token", async () => {
		req.cookies = {};
		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		expect(res.status).toHaveBeenCalledWith(ResponseStatus.UNAUTHORIZED.code);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.UNAUTHORIZED.message,
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 401 if refresh token is invalid (UnauthorizedError)", async () => {
		req.cookies = { refresh_token: "refreshToken" };
		vi.spyOn(tokenService, "rotateAuthTokens").mockRejectedValue(
			new UnauthorizedError("Unauthorized"),
		);
		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		expect(res.status).toHaveBeenCalledWith(ResponseStatus.UNAUTHORIZED.code);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.UNAUTHORIZED.message,
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 500 if rotateAuthTokens throws non-UnauthorizedError", async () => {
		req.cookies = { refresh_token: "refreshToken" };
		vi.spyOn(tokenService, "rotateAuthTokens").mockRejectedValue(
			new Error("fail"),
		);
		authMiddleware(req as Request, res as Response, next);
		await new Promise((r) => setImmediate(r));
		expect(res.status).toHaveBeenCalledWith(
			ResponseStatus.INTERNAL_SERVER_ERROR.code,
		);
		expect(res.json).toHaveBeenCalledWith({
			message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
		});
		expect(next).not.toHaveBeenCalled();
	});
});
