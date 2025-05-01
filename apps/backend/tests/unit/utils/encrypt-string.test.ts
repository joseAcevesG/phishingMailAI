import { beforeEach, describe, expect, it, vi } from "vitest";
import * as encryptString from "../../../src/utils/encrypt-string";
import { EncryptError } from "../../../src/utils/errors";

// Mock EnvConfig to control the secret key and salt
vi.mock("../../../src/config/env.config", () => ({
	EnvConfig: () => ({ secretKey: "test-key", salt: "test-salt" }),
}));

describe("encrypt-string util", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should encrypt and decrypt a string correctly", async () => {
		const text = "my secret text";
		const encrypted = await encryptString.encrypt(text);
		expect(typeof encrypted).toBe("string");
		const decrypted = await encryptString.decrypt(encrypted);
		expect(decrypted).toBe(text);
	});

	it("should throw EncryptError for invalid format in decrypt", async () => {
		await expect(encryptString.decrypt("invalid-format")).rejects.toThrow(
			EncryptError,
		);
	});
});
