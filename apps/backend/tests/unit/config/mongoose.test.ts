import mongoose from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as envConfigModule from "../../../src/config/env.config";
import connectDB from "../../../src/config/mongoose";

// Save original process.exit
const originalProcessExit = process.exit;

// Mock EnvConfig to control dbUrl
const mockDbUrl = "mongodb://localhost:27017/testdb";

// Helper to restore mocks and process.exit
afterEach(() => {
	vi.restoreAllMocks();
	process.exit = originalProcessExit;
});

describe("connectDB", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it("should connect to MongoDB successfully", async () => {
		vi.spyOn(envConfigModule, "EnvConfig").mockReturnValue({
			environment: "test",
			port: 1234,
			freeTrialLimit: 1,
			stytch: { projectId: "test", secret: "test" },
			secretKey: "test",
			salt: "test",
			tokenKey: "test",
			dbUrl: mockDbUrl,
			openai: { apiKey: "test" },
		});
		const connectSpy = vi
			.spyOn(mongoose, "connect")
			.mockResolvedValueOnce(mongoose as typeof mongoose);
		const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		await connectDB();

		expect(envConfigModule.EnvConfig).toHaveBeenCalled();
		expect(connectSpy).toHaveBeenCalledWith(mockDbUrl);
		expect(consoleLogSpy).toHaveBeenCalledWith(
			"MongoDB connected successfully",
		);
	});

	it("should handle MongoDB connection error and exit process", async () => {
		vi.spyOn(envConfigModule, "EnvConfig").mockReturnValue({
			environment: "test",
			port: 1234,
			freeTrialLimit: 1,
			stytch: { projectId: "test", secret: "test" },
			secretKey: "test",
			salt: "test",
			tokenKey: "test",
			dbUrl: mockDbUrl,
			openai: { apiKey: "test" },
		});
		const error = new Error("Connection failed");
		vi.spyOn(mongoose, "connect").mockRejectedValueOnce(error);
		const exitSpy = vi.fn((code?: number) => {
			throw new Error(`process.exit: ${code}`);
		}) as (code?: number) => never;
		process.exit = exitSpy;

		let thrownError: unknown;
		try {
			await connectDB();
		} catch (err) {
			thrownError = err;
		}

		expect(envConfigModule.EnvConfig).toHaveBeenCalled();
		expect(exitSpy).toHaveBeenCalledWith(1);
		expect((thrownError as Error)?.message).toBe("process.exit: 1");
	});
});
