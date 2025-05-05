// Unit tests for EnvConfig utility
// Uses Vitest and tests environment variable parsing, defaults, and error handling
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EnvError } from "../../../src/utils/errors";

// Save original environment variables to restore after each test
const ORIGINAL_ENV = { ...process.env };

// Test suite for EnvConfig
// Covers scenarios: all env vars provided, defaults applied, required env missing

describe("EnvConfig", () => {
	// Reset module cache and restore original environment before each test
	beforeEach(() => {
		vi.resetModules(); // Clear module cache to force fresh import
		process.env = { ...ORIGINAL_ENV }; // Restore original env
	});

	// Test: All environment variables provided
	it("returns correct config when environment variables are provided", async () => {
		// Set environment variables for test
		process.env.NODE_ENV = "production";
		process.env.PORT = "9090";
		process.env.FREE_TRIAL_LIMIT = "7";
		process.env.STYTCH_PROJECT_ID = "stytch-id";
		process.env.STYTCH_SECRET = "stytch-secret";
		process.env.SECRET_KEY = "secret-key";
		process.env.SALT = "salt";
		process.env.TOKEN_KEY = "token-key";
		process.env.DB_URL = "postgres://user:pass@localhost:5432/db";
		process.env.OPENAI_API_KEY = "openai-key";

		// Import EnvConfig and create config instance
		const { EnvConfig } = await import("../../../src/config/env.config");
		const config = EnvConfig();

		// Verify config matches expected structure and values
		expect(config).toEqual({
			environment: "production",
			port: 9090,
			freeTrialLimit: 7,
			stytch: {
				projectId: "stytch-id",
				secret: "stytch-secret",
			},
			secretKey: "secret-key",
			salt: "salt",
			tokenKey: "token-key",
			dbUrl: "postgres://user:pass@localhost:5432/db",
			openai: {
				apiKey: "openai-key",
			},
		});
	});

	// Test: Defaults are applied for missing optional env vars
	it("applies default values for missing optional environment variables", async () => {
		// Set environment variables for test, omitting optional vars
		process.env.STYTCH_PROJECT_ID = "stytch-id";
		process.env.STYTCH_SECRET = "stytch-secret";
		process.env.SECRET_KEY = "secret-key";
		process.env.SALT = "salt";
		process.env.TOKEN_KEY = "token-key";
		process.env.DB_URL = "postgres://user:pass@localhost:5432/db";
		process.env.OPENAI_API_KEY = "openai-key";
		process.env.NODE_ENV = undefined;
		process.env.PORT = undefined;
		process.env.FREE_TRIAL_LIMIT = undefined;

		// Import EnvConfig and create config instance
		const { EnvConfig } = await import("../../../src/config/env.config");
		const config = EnvConfig();

		// Verify defaults are used for missing optional env vars
		expect(config.environment).toBe("development");
		expect(config.port).toBe(3000);
		expect(config.freeTrialLimit).toBe(3);
	});

	// Test: Throws error if required env var is missing
	it("throws EnvError when required environment variable is missing", async () => {
		// Set environment variables for test, omitting required var
		process.env.PORT = "3000";
		process.env.FREE_TRIAL_LIMIT = "3";
		process.env.STYTCH_SECRET = "stytch-secret";
		process.env.SECRET_KEY = "secret-key";
		process.env.SALT = "salt";
		process.env.TOKEN_KEY = "token-key";
		process.env.DB_URL = "postgres://user:pass@localhost:5432/db";
		process.env.OPENAI_API_KEY = "openai-key";
		process.env.STYTCH_PROJECT_ID = undefined;

		// Expect EnvError to be thrown when importing EnvConfig
		await expect(
			import("../../../src/config/env.config"),
		).rejects.toBeInstanceOf(EnvError);
	});
});
