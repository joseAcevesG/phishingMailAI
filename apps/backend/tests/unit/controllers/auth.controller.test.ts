import { beforeEach, describe, expect, it, vi } from "vitest";
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
import type { Request, Response } from "express";
import AuthController from "../../../src/controllers/auth.controller";
import * as tokenService from "../../../src/utils/token-service";

// Unit tests for AuthController.status
// Add more tests easily within this describe block

describe("AuthController.status", () => {
	let req: Partial<Request>;
	// biome-ignore lint/suspicious/noExplicitAny: ignore for tests
	let res: Partial<Response> & { status: any; json: any };

	beforeEach(() => {
		req = { cookies: {} };
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};
		vi.restoreAllMocks();
	});

	it("should return authenticated true and email when session token is valid", async () => {
		// Arrange
		req.cookies = { session_token: "validToken" };
		vi.spyOn(tokenService, "verifyAccessToken").mockResolvedValue({
			email: "user@example.com",
			// biome-ignore lint/suspicious/noExplicitAny: ignore for tests
		} as any);

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

	// TODO: add tests for refresh token flow and error cases
});
