import type { Response } from "express";
import type { Types } from "mongoose";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import RefreshTokenModel from "../../../src/models/refresh-token.model";
import User from "../../../src/models/user.model";
import * as createToken from "../../../src/utils/create-token";
import { UnauthorizedError } from "../../../src/utils/errors";
import * as tokenService from "../../../src/utils/token-service";

// Mock user and token doc for use in tests
// These mocks represent a user and a refresh token document in the database
const mockUser = { email: "user@example.com", _id: "u1", token_version: 0 };
const mockTokenDoc = { user: "u1", tokens: ["old"], save: vi.fn() };
const mockRes = () => ({ cookie: vi.fn() }) as unknown as Response;

// Mock all external dependencies and database models to isolate logic
// This allows us to test the token-service utility in isolation
vi.mock("../../../src/utils/create-token", () => ({
	code: vi.fn(() => "access.jwt"),
	decode: vi.fn(() => ({ email: mockUser.email })),
}));
vi.mock("../../../src/models/user.model", () => ({
	default: { findOne: vi.fn(), findById: vi.fn() },
}));
vi.mock("../../../src/models/refresh-token.model", () => ({
	default: {
		findOne: vi.fn(),
		findOneAndUpdate: vi.fn(),
		deleteOne: vi.fn(),
	},
}));

// Mock randomBytes to return predictable value for tests
// This ensures that the tests are deterministic and not affected by random values
vi.spyOn(require("node:crypto"), "randomBytes").mockImplementation(() =>
	Buffer.from("a".repeat(64)),
);

// Test suite for token-service utility
// Covers all major code paths for access/refresh token verification, rotation, issuance, and deletion
describe("token-service util", () => {
	beforeEach(() => {
		// Clear all mocks before each test to ensure isolation
		vi.clearAllMocks();
	});

	// --- verifyAccessToken ---
	describe("verifyAccessToken", () => {
		// Should resolve with user if token is valid and user exists
		// This test case covers the happy path where the token is valid and the user exists
		it("resolves with user if token valid and user exists", async () => {
			(User.findOne as Mock).mockResolvedValue(mockUser);
			(createToken.decode as Mock).mockReturnValue({
				email: mockUser.email,
				v: mockUser.token_version,
			});
			const user = await tokenService.verifyAccessToken("token");
			expect(User.findOne).toHaveBeenCalledWith({ email: mockUser.email });
			expect(user).toBe(mockUser);
		});

		// Should reject if token is invalid
		// This test case covers the scenario where the token is invalid
		it("rejects if token invalid", async () => {
			(createToken.decode as Mock).mockReturnValue(null);
			await expect(tokenService.verifyAccessToken("bad")).rejects.toThrow(
				UnauthorizedError,
			);
		});

		// Should reject if user is not found
		// This test case covers the scenario where the user is not found
		it("rejects if user not found", async () => {
			(User.findOne as Mock).mockResolvedValue(null);
			(createToken.decode as Mock).mockReturnValue({
				email: mockUser.email,
				v: mockUser.token_version,
			});
			await expect(tokenService.verifyAccessToken("token")).rejects.toThrow(
				UnauthorizedError,
			);
		});
	});

	// --- rotateAuthTokens ---
	describe("rotateAuthTokens", () => {
		// Should rotate tokens, set cookies, and return user and new refresh token
		// This test case covers the happy path where the token is valid and the user exists
		it("rotates tokens and sets cookies", async () => {
			(RefreshTokenModel.findOne as Mock).mockResolvedValue({
				...mockTokenDoc,
				tokens: ["old"],
			});
			(User.findById as Mock).mockResolvedValue(mockUser);
			mockTokenDoc.save.mockResolvedValue(mockTokenDoc);
			const res = mockRes();
			const result = await tokenService.rotateAuthTokens("old", res);
			expect(result.user).toBe(mockUser);
			expect(result.newRefreshToken).toBeTypeOf("string");
			expect(res.cookie).toHaveBeenCalled();
		});

		// Should throw if token doc not found
		// This test case covers the scenario where the token document is not found
		it("throws if token doc not found", async () => {
			(RefreshTokenModel.findOne as Mock).mockResolvedValue(null);
			const res = mockRes();
			await expect(tokenService.rotateAuthTokens("bad", res)).rejects.toThrow(
				UnauthorizedError,
			);
		});

		// Should throw if user not found
		// This test case covers the scenario where the user is not found
		it("throws if user not found", async () => {
			(RefreshTokenModel.findOne as Mock).mockResolvedValue(mockTokenDoc);
			(User.findById as Mock).mockResolvedValue(null);
			const res = mockRes();
			await expect(tokenService.rotateAuthTokens("old", res)).rejects.toThrow(
				UnauthorizedError,
			);
		});
	});

	// --- issueAuthTokens ---
	describe("issueAuthTokens", () => {
		// Should issue tokens, update refresh model, and set cookies
		// This test case covers the happy path where the user exists and the refresh token is updated
		it("issues tokens, updates refresh model, and sets cookies", async () => {
			(RefreshTokenModel.findOneAndUpdate as Mock).mockResolvedValue({});
			const res = mockRes();
			const result = await tokenService.issueAuthTokens(
				res,
				mockUser.email,
				0, // tokenVersion argument
				"u1" as unknown as Types.ObjectId,
			);
			expect(result.accessToken).toBeTypeOf("string");
			expect(result.refreshToken).toBeTypeOf("string");
			expect(res.cookie).toHaveBeenCalledWith(
				"session_token",
				expect.any(String),
				expect.objectContaining({ maxAge: expect.any(Number) }),
			);
			expect(res.cookie).toHaveBeenCalledWith(
				"refresh_token",
				expect.any(String),
				expect.objectContaining({ maxAge: expect.any(Number) }),
			);
			expect(RefreshTokenModel.findOneAndUpdate).toHaveBeenCalledWith(
				{ user: "u1" },
				{ $push: { tokens: expect.any(String) } },
				{ upsert: true },
			);
		});
	});

	// --- deleteAllAuthTokens ---
	describe("deleteAllAuthTokens", () => {
		// Should call deleteOne with userId
		// This test case covers the scenario where all auth tokens are deleted for a user
		it("calls deleteOne with userId", async () => {
			(RefreshTokenModel.deleteOne as Mock).mockResolvedValue({});
			await tokenService.deleteAllAuthTokens("u1");
			expect(RefreshTokenModel.deleteOne).toHaveBeenCalledWith({ user: "u1" });
		});
	});

	// --- deleteAuthToken ---
	describe("deleteAuthToken", () => {
		// Should call findOneAndUpdate with userId and refreshToken
		// This test case covers the scenario where a single auth token is deleted for a user
		it("calls findOneAndUpdate with userId and refreshToken", async () => {
			(RefreshTokenModel.findOneAndUpdate as Mock).mockResolvedValue({});
			await tokenService.deleteAuthToken("u1", "refresh");
			expect(RefreshTokenModel.findOneAndUpdate).toHaveBeenCalledWith(
				{ user: "u1" },
				{ $pull: { tokens: "refresh" } },
				{ new: true },
			);
		});
	});
});
