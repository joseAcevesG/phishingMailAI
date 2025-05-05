// Unit tests for stytchClient configuration
// Uses Vitest and mocks EnvConfig and stytch to test Stytch client instantiation
import { beforeEach, describe, expect, it, vi } from "vitest";

// Declare a global variable to capture the config passed to Stytch.Client
// This allows us to verify the correct config is used during instantiation
declare global {
	var __stytchClientConfig: Record<string, string> | null;
}

// Mock EnvConfig to provide test projectId and secret for Stytch
vi.mock("../../../src/config/env.config", () => ({
	EnvConfig: () => ({
		stytch: { projectId: "test-id", secret: "test-secret" },
	}),
}));

// Mock stytch module to capture config and provide a dummy method
vi.mock("stytch", () => ({
	default: {
		Client: class {
			constructor(config: Record<string, string>) {
				global.__stytchClientConfig = config;
			}
			dummy() {}
		},
	},
}));

// Test suite for stytchClient config
// Covers correct instantiation and export behavior

describe("stytchClient config", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.__stytchClientConfig = null;
	});

	// Test: Stytch.Client should be instantiated with correct config
	it("should instantiate stytch.Client with correct config", async () => {
		const { stytchClient } = await import("../../../src/config/stytch");
		expect(global.__stytchClientConfig).toEqual({
			project_id: "test-id",
			secret: "test-secret",
		});
		expect(stytchClient).toBeDefined();
	});

	// Test: stytchClient should be exported as an object with methods
	it("should export the stytchClient instance as an object", async () => {
		const { stytchClient } = await import("../../../src/config/stytch");
		expect(stytchClient).toBeDefined();
		expect(typeof stytchClient).toBe("object");
		expect(typeof (stytchClient as { dummy?: () => void }).dummy).toBe(
			"function",
		);
	});
});
