import { describe, expect, it, vi } from "vitest";
import { getOnUnauthorized, setOnUnauthorized } from "./authHandler";

describe("authHandler", () => {
	// Test that getOnUnauthorized returns null by default
	it("should return null by default", () => {
		expect(getOnUnauthorized()).toBeNull();
	});

	// Test that setOnUnauthorized sets the handler and getOnUnauthorized returns it
	it("should set and get the handler", () => {
		const handler = vi.fn();
		setOnUnauthorized(handler);
		expect(getOnUnauthorized()).toBe(handler);
	});

	// Test that setOnUnauthorized replaces the handler when called again
	it("should replace the handler when set again", () => {
		const handler1 = vi.fn();
		const handler2 = vi.fn();
		setOnUnauthorized(handler1);
		expect(getOnUnauthorized()).toBe(handler1);
		setOnUnauthorized(handler2);
		expect(getOnUnauthorized()).toBe(handler2);
	});
});
