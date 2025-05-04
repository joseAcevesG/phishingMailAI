import { describe, expect, it } from "vitest";
import { validateAll, validatePassword } from "./validatePassword";

describe("validatePassword", () => {
	it("returns error for password shorter than 8 chars", () => {
		const result = validatePassword("abc");
		expect(result).toContain("The password must have at least 8 characters.");
	});

	it("returns error for missing character types", () => {
		// Only lowercase
		const result = validatePassword("abcdefgh");
		expect(result).toContain(
			"The password must contain at least 4 of the following types: lowercase letters, uppercase letters, digits, symbols.",
		);
	});

	it("returns no error for strong password", () => {
		const result = validatePassword("Abcdef1$");
		expect(result).toHaveLength(0);
	});
});

describe("validateAll", () => {
	it("returns null if both fields empty", () => {
		expect(validateAll("", "")).toBeNull();
	});

	it("returns error if passwords do not match", () => {
		expect(validateAll("Abcdef1$", "different")).toBe(
			"Passwords do not match.",
		);
	});

	it("returns password errors if invalid", () => {
		const msg = validateAll("abc", "abc");
		expect(msg).toMatch(/The password must have at least 8 characters\./);
	});

	it("returns null if valid and matching", () => {
		expect(validateAll("Abcdef1$", "Abcdef1$")).toBeNull();
	});
});
