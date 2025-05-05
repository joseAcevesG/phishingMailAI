import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FetchConfig } from "../types";
import { useFetch } from "./useFetch";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useFetch", () => {
	// This base config is used for all tests
	const baseConfig: FetchConfig = { url: "/api/test" };

	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	// Test that the component initializes with loading true if auto is true
	it("should initialize with loading true if auto is true", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ foo: "bar" }),
		});
		const { result } = renderHook(() =>
			useFetch<{ foo: string }>(baseConfig, true),
		);
		expect(result.current.loading).toBe(true);
		await act(async () => {
			await Promise.resolve();
		});
		expect(result.current.loading).toBe(false);
		expect(result.current.data).toEqual({ foo: "bar" });
		expect(result.current.error).toBeNull();
	});

	// Test that the component does not auto-fetch if auto is false
	it("should not auto-fetch if auto is false", async () => {
		const { result } = renderHook(() =>
			useFetch<{ foo: string }>(baseConfig, false),
		);
		expect(result.current.loading).toBe(false);
		expect(result.current.data).toBeNull();
	});

	// Test that the component handles fetch errors and sets error message
	it("should handle fetch errors and set error message", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 400,
			statusText: "Bad Request",
			json: async () => ({ message: "Invalid" }),
		});
		const { result } = renderHook(() =>
			useFetch<{ foo: string }>(baseConfig, true),
		);
		await act(async () => {
			await Promise.resolve();
		});
		expect(result.current.error).toBe("Invalid");
		expect(result.current.data).toBeNull();
	});

	// Test that the component handles network error and sets generic error message
	it("should handle network error and set generic error message", async () => {
		mockFetch.mockRejectedValueOnce(new Error("Network error"));
		const { result } = renderHook(() =>
			useFetch<{ foo: string }>(baseConfig, true),
		);
		await act(async () => {
			await Promise.resolve();
		});
		expect(result.current.error).toBe("Network error");
		expect(result.current.data).toBeNull();
	});

	// Test that the component supports manual execution via execute()
	it("should support manual execution via execute()", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ foo: "baz" }),
		});
		const { result } = renderHook(() =>
			useFetch<{ foo: string }>(baseConfig, false),
		);
		await act(async () => {
			await result.current.execute();
		});
		expect(result.current.data).toEqual({ foo: "baz" });
		expect(result.current.loading).toBe(false);
	});

	// Test that the component aborts previous request if execute is called again
	it("should abort previous request if execute is called again", async () => {
		const abortSpy = vi.spyOn(AbortController.prototype, "abort");
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({ foo: "bar" }),
		});
		const { result } = renderHook(() =>
			useFetch<{ foo: string }>(baseConfig, false),
		);
		await act(async () => {
			await Promise.all([result.current.execute(), result.current.execute()]);
		});
		expect(abortSpy).toHaveBeenCalled();
		abortSpy.mockRestore();
	});
});
