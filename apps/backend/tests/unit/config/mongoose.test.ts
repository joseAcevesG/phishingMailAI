// Unit tests for connectDB utility (MongoDB connection)
// Uses Vitest and mocks mongoose, env config, and process.exit for connection scenarios
import mongoose from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as envConfigModule from "../../../src/config/env.config";
import connectDB from "../../../src/config/mongoose";

// Save original process.exit to restore after each test
const originalProcessExit = process.exit;

// Use a mock database URL for testing
const mockDbUrl = "mongodb://localhost:27017/testDB";

// Restore all mocks and process.exit after each test
afterEach(() => {
	vi.restoreAllMocks();
	process.exit = originalProcessExit;
});

// Test suite for connectDB
// Covers successful connection and error handling

describe("connectDB", () => {
	beforeEach(() => {
		vi.resetModules(); // Reset module cache before each test
	});

	// Test: Successful MongoDB connection
	it("should connect to MongoDB successfully", async () => {
		// Mock EnvConfig to provide test DB URL
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
		// Mock mongoose.connect to resolve successfully
		const connectSpy = vi
			.spyOn(mongoose, "connect")
			.mockResolvedValueOnce(mongoose as typeof mongoose);
		// Mock console.log to suppress output
		const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		await connectDB();

		// Verify EnvConfig and mongoose.connect were called with correct arguments
		expect(envConfigModule.EnvConfig).toHaveBeenCalled();
		expect(connectSpy).toHaveBeenCalledWith(mockDbUrl);
		// Verify success message was logged
		expect(consoleLogSpy).toHaveBeenCalledWith(
			"MongoDB connected successfully",
		);
	});

	// Test: Handle MongoDB connection error and exit process
	it("should handle MongoDB connection error and exit process", async () => {
		// Mock EnvConfig to provide test DB URL
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
		// Mock mongoose.connect to reject with an error
		const error = new Error("Connection failed");
		vi.spyOn(mongoose, "connect").mockRejectedValueOnce(error);
		// Mock process.exit to throw instead of exiting
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

		// Verify EnvConfig and process.exit were called
		expect(envConfigModule.EnvConfig).toHaveBeenCalled();
		expect(exitSpy).toHaveBeenCalledWith(1);
		// Verify the thrown error is from the mocked process.exit
		expect((thrownError as Error)?.message).toBe("process.exit: 1");
	});
});
