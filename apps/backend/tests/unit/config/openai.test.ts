import OpenAI from "openai";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock EnvConfig
vi.mock("../../../src/config/env.config", () => ({
	EnvConfig: () => ({ openai: { apiKey: "test-api-key" } }),
}));

import OpenAIConfigDefault, {
	OpenAIConfig as OpenAIConfigClass,
} from "../../../src/config/openai";

describe("OpenAIConfig", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with SYSTEM_PROMPT", () => {
		expect(OpenAIConfigDefault.SYSTEM_PROMPT).toMatch(/phishingProbability/);
		expect(typeof OpenAIConfigDefault.SYSTEM_PROMPT).toBe("string");
	});

	it("should initialize openai with apiKey from EnvConfig", () => {
		expect(OpenAIConfigDefault.openai).toBeInstanceOf(OpenAI);
	});

	it("should change api key when changeApiKey is called", () => {
		// Use a fresh instance for this test
		const config = new OpenAIConfigClass();
		const oldOpenAI = config.openai;
		config.changeApiKey("new-key");
		expect(config.openai).not.toBe(oldOpenAI);
		expect(config.openai).toBeInstanceOf(OpenAI);
	});
});
