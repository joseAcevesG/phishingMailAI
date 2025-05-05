import { describe, expect, it } from "vitest";
import { validateAll, validatePassword } from "./validatePassword";

// Tests for the validatePassword function
// This function checks password length and character requirements
// Returns an array of error messages or an empty array if valid

describe("validatePassword", () => {
	// Test: Should return error for password shorter than 8 chars
	it("returns error for password shorter than 8 chars", () => {
		const result = validatePassword("abc");
		expect(result).toContain("The password must have at least 8 characters.");
	});

	// Test: Should return error for missing character types (e.g., only lowercase)
	it("returns error for missing character types", () => {
		// Only lowercase
		const result = validatePassword("abcdefgh");
		expect(result).toContain(
			"The password must contain at least 4 of the following types: lowercase letters, uppercase letters, digits, symbols.",
		);
	});

	// Test: Should return no error for strong password
	it("returns no error for strong password", () => {
		const result = validatePassword("Abcdef1$");
		expect(result).toHaveLength(0);
	});
});

// Tests for the validateAll function
// This function checks that passwords match and are valid
// Returns null if valid, otherwise returns an error message

describe("validateAll", () => {
	// Test: Should return null if both fields are empty
	it("returns null if both fields empty", () => {
		expect(validateAll("", "")).toBeNull();
	});

	// Test: Should return error if passwords do not match
	it("returns error if passwords do not match", () => {
		expect(validateAll("Abcdef1$", "different")).toBe(
			"Passwords do not match.",
		);
	});

	// Test: Should return password errors if invalid
	it("returns password errors if invalid", () => {
		const msg = validateAll("abc", "abc");
		expect(msg).toMatch(/The password must have at least 8 characters\./);
	});

	// Test: Should return null if valid and matching
	it("returns null if valid and matching", () => {
		expect(validateAll("Abcdef1$", "Abcdef1$")).toBeNull();
	});
});
