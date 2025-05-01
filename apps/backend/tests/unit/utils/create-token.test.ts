import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InputToken } from "../../../src/types";
import * as createToken from "../../../src/utils/create-token";

// Mock EnvConfig to control the secret key
vi.mock("../../../src/config/env.config", () => ({
	EnvConfig: () => ({ tokenKey: "test-secret" }),
}));

describe("create-token util", () => {
	const data: InputToken = { email: "user@example.com" };

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create a valid JWT and decode it correctly", () => {
		const token = createToken.code(data);
		expect(typeof token).toBe("string");
		const decoded = createToken.decode(token);
		expect(decoded).toMatchObject(data);
	});

	it("should return null for an invalid token", () => {
		const result = createToken.decode("invalid.token.value");
		expect(result).toBeNull();
	});
});
