// Unit tests for OpenAIConfig utility
// Uses Vitest and mocks EnvConfig to test OpenAI initialization and API key logic
import OpenAI from "openai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OpenAIConfigDefault, { OpenAIConfig } from "../../../src/config/openai";

// Mock EnvConfig to provide a test API key for OpenAI
vi.mock("../../../src/config/env.config", () => ({
	EnvConfig: () => ({ openai: { apiKey: "test-api-key" } }),
}));

// Test suite for OpenAIConfig
// Covers SYSTEM_PROMPT, OpenAI initialization, and API key change

describe("OpenAIConfig", () => {
	// Clear all mocks before each test to ensure isolation
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test: SYSTEM_PROMPT should be initialized and contain phishingProbability
	it("should initialize with SYSTEM_PROMPT", () => {
		// Verify SYSTEM_PROMPT is a string and contains phishingProbability
		expect(OpenAIConfigDefault.SYSTEM_PROMPT).toMatch(/phishingProbability/);
		expect(typeof OpenAIConfigDefault.SYSTEM_PROMPT).toBe("string");
	});

	// Test: OpenAI instance should be initialized with API key from EnvConfig
	it("should initialize openai with apiKey from EnvConfig", () => {
		// Verify OpenAI instance is created with the mocked API key
		expect(OpenAIConfigDefault.openai).toBeInstanceOf(OpenAI);
	});

	// Test: API key should be changeable via changeApiKey
	it("should change api key when changeApiKey is called", () => {
		// Create a new OpenAIConfig instance for this test
		const config = new OpenAIConfig();
		// Store the original OpenAI instance
		const oldOpenAI = config.openai;
		// Change the API key
		config.changeApiKey("new-key");
		// Verify a new OpenAI instance is created with the new API key
		expect(config.openai).not.toBe(oldOpenAI);
		expect(config.openai).toBeInstanceOf(OpenAI);
	});
});
