import { beforeEach, describe, expect, it, vi } from "vitest";
import { EnvError } from "../../../src/utils/errors";

const ORIGINAL_ENV = { ...process.env };

describe("EnvConfig", () => {
	beforeEach(() => {
		vi.resetModules();
		process.env = { ...ORIGINAL_ENV };
	});

	it("returns correct config when environment variables are provided", async () => {
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

		const { EnvConfig } = await import("../../../src/config/env.config");
		const config = EnvConfig();
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

	it("applies default values for missing optional environment variables", async () => {
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

		const { EnvConfig } = await import("../../../src/config/env.config");
		const config = EnvConfig();
		expect(config.environment).toBe("development");
		expect(config.port).toBe(3000);
		expect(config.freeTrialLimit).toBe(3);
	});

	it("throws EnvError when required environment variable is missing", async () => {
		process.env.PORT = "3000";
		process.env.FREE_TRIAL_LIMIT = "3";
		process.env.STYTCH_SECRET = "stytch-secret";
		process.env.SECRET_KEY = "secret-key";
		process.env.SALT = "salt";
		process.env.TOKEN_KEY = "token-key";
		process.env.DB_URL = "postgres://user:pass@localhost:5432/db";
		process.env.OPENAI_API_KEY = "openai-key";
		process.env.STYTCH_PROJECT_ID = undefined;

		await expect(
			import("../../../src/config/env.config"),
		).rejects.toBeInstanceOf(EnvError);
	});
});
