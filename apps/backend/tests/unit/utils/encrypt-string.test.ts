import { beforeEach, describe, expect, it, vi } from "vitest";
import * as encryptString from "../../../src/utils/encrypt-string";
import { EncryptError } from "../../../src/utils/errors";

// Mock environment config to provide consistent secret and salt values for encryption
vi.mock("../../../src/config/env.config", () => ({
	EnvConfig: () => ({ secretKey: "test-key", salt: "test-salt" }),
}));

// Test suite for encrypt-string utility
// Ensures correct encryption, decryption, and error handling

describe("encrypt-string util", () => {
	// Clear mocks before each test for isolation
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test: Should encrypt and decrypt a string correctly
	it("should encrypt and decrypt a string correctly", async () => {
		const text = "my secret text";
		const encrypted = await encryptString.encrypt(text);
		expect(typeof encrypted).toBe("string");
		const decrypted = await encryptString.decrypt(encrypted);
		expect(decrypted).toBe(text);
	});

	// Test: Should throw EncryptError for invalid format in decrypt
	it("should throw EncryptError for invalid format in decrypt", async () => {
		await expect(encryptString.decrypt("invalid-format")).rejects.toThrow(
			EncryptError,
		);
	});
});
