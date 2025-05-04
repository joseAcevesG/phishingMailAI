import type { Response } from "express";
import type { Types } from "mongoose";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import RefreshTokenModel from "../../../src/models/refresh-token.model";
import User from "../../../src/models/user.model";
import * as createToken from "../../../src/utils/create-token";
import { UnauthorizedError } from "../../../src/utils/errors";
import * as tokenService from "../../../src/utils/token-service";

const mockUser = { email: "user@example.com", _id: "u1" };
const mockTokenDoc = { user: "u1", tokens: ["old"], save: vi.fn() };
const mockRes = () => ({ cookie: vi.fn() }) as unknown as Response;

vi.mock("../../../src/config/env.config", () => ({
	EnvConfig: () => ({ environment: "test" }),
}));
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

vi.spyOn(require("node:crypto"), "randomBytes").mockImplementation(() =>
	Buffer.from("a".repeat(64)),
);

describe("token-service util", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("verifyAccessToken", () => {
		it("resolves with user if token valid and user exists", async () => {
			(User.findOne as Mock).mockResolvedValue(mockUser);
			(createToken.decode as Mock).mockReturnValue({ email: mockUser.email });
			const user = await tokenService.verifyAccessToken("token");
			expect(User.findOne).toHaveBeenCalledWith({ email: mockUser.email });
			expect(user).toBe(mockUser);
		});

		it("rejects if token invalid", async () => {
			(createToken.decode as Mock).mockReturnValue(null);
			await expect(tokenService.verifyAccessToken("bad")).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("rejects if user not found", async () => {
			(User.findOne as Mock).mockResolvedValue(null);
			(createToken.decode as Mock).mockReturnValue({ email: mockUser.email });
			await expect(tokenService.verifyAccessToken("token")).rejects.toThrow(
				UnauthorizedError,
			);
		});
	});

	describe("rotateAuthTokens", () => {
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

		it("throws if token doc not found", async () => {
			(RefreshTokenModel.findOne as Mock).mockResolvedValue(null);
			const res = mockRes();
			await expect(tokenService.rotateAuthTokens("bad", res)).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("throws if user not found", async () => {
			(RefreshTokenModel.findOne as Mock).mockResolvedValue(mockTokenDoc);
			(User.findById as Mock).mockResolvedValue(null);
			const res = mockRes();
			await expect(tokenService.rotateAuthTokens("old", res)).rejects.toThrow(
				UnauthorizedError,
			);
		});
	});

	describe("issueAuthTokens", () => {
		it("issues tokens, updates refresh model, and sets cookies", async () => {
			(RefreshTokenModel.findOneAndUpdate as Mock).mockResolvedValue({});
			const res = mockRes();
			const result = await tokenService.issueAuthTokens(
				res,
				mockUser.email,
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

	describe("deleteAllAuthTokens", () => {
		it("calls deleteOne with userId", async () => {
			(RefreshTokenModel.deleteOne as Mock).mockResolvedValue({});
			await tokenService.deleteAllAuthTokens("u1");
			expect(RefreshTokenModel.deleteOne).toHaveBeenCalledWith({ user: "u1" });
		});
	});

	describe("deleteAuthToken", () => {
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
