import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InputToken } from "../../../src/types";
import * as createToken from "../../../src/utils/create-token";

// Mock environment config to ensure consistent secret for token generation
vi.mock("../../../src/config/env.config", () => ({
	EnvConfig: () => ({ tokenKey: "test-secret" }),
}));

// Test suite for create-token utility functions
// Ensures correct JWT creation, decoding, and error handling

describe("create-token util", () => {
	const data: InputToken = { email: "user@example.com" };

	// Clear mocks before each test to ensure isolation
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test: Should generate a valid JWT and decode it back to the original data
	it("should create a valid JWT and decode it correctly", () => {
		const token = createToken.code(data);
		expect(typeof token).toBe("string");
		const decoded = createToken.decode(token);
		expect(decoded).toMatchObject(data);
	});

	// Test: Decoding an invalid token should return null
	it("should return null for an invalid token", () => {
		const result = createToken.decode("invalid.token.value");
		expect(result).toBeNull();
	});
});
