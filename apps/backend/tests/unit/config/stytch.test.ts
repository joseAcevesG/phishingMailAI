import { beforeEach, describe, expect, it, vi } from "vitest";

declare global {
	// eslint-disable-next-line no-var
	var __stytchClientConfig: Record<string, string> | null;
}

vi.mock("../../../src/config/env.config", () => ({
	EnvConfig: () => ({
		stytch: { projectId: "test-id", secret: "test-secret" },
	}),
}));

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

describe("stytchClient config", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.__stytchClientConfig = null;
	});

	it("should instantiate stytch.Client with correct config", async () => {
		const { stytchClient } = await import("../../../src/config/stytch");
		expect(global.__stytchClientConfig).toEqual({
			project_id: "test-id",
			secret: "test-secret",
		});
		expect(stytchClient).toBeDefined();
	});

	it("should export the stytchClient instance as an object", async () => {
		const { stytchClient } = await import("../../../src/config/stytch");
		expect(stytchClient).toBeDefined();
		expect(typeof stytchClient).toBe("object");
		expect(typeof (stytchClient as { dummy?: () => void }).dummy).toBe(
			"function",
		);
	});
});
