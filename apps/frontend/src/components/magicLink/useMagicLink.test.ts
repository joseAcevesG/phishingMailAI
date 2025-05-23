import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { useFetch } from "../../hooks/useFetch";
import { useMagicLink } from "./useMagicLink";

// Mock the useFetch hook with a mock implementation
vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));

// Assign the mock implementation to a variable
const mockUseFetch = useFetch as unknown as Mock;

describe("useMagicLink", () => {
	// Mock the execute function for the useFetch hook
	let executeMock: Mock;
	beforeEach(() => {
		executeMock = vi.fn();
		// Reset the mock implementation for the useFetch hook
		mockUseFetch.mockReturnValue({
			data: null,
			loading: false,
			execute: executeMock,
			error: null,
		});
	});

	it("initializes with default values", () => {
		const { result } = renderHook(() =>
			useMagicLink({ url: "/api/magic-link" }),
		);
		expect(result.current.email).toBe("");
		expect(result.current.isButtonDisabled).toBe(false);
		expect(result.current.countdown).toBe(15);
		expect(result.current.error).toBe(null);
		expect(typeof result.current.setEmail).toBe("function");
		expect(typeof result.current.setError).toBe("function");
		expect(typeof result.current.handleMagicLinkRequest).toBe("function");
	});

	it("sets email and error", () => {
		const { result } = renderHook(() =>
			useMagicLink({ url: "/api/magic-link" }),
		);
		act(() => {
			result.current.setEmail("test@example.com");
			result.current.setError("Some error");
		});
		expect(result.current.email).toBe("test@example.com");
		expect(result.current.error).toBe("Some error");
	});

	it("shows error if fetchError is set", () => {
		// Set the fetchError property of the mock implementation
		mockUseFetch.mockReturnValue({
			data: null,
			loading: false,
			execute: executeMock,
			error: "Fetch error",
		});
		const { result } = renderHook(() =>
			useMagicLink({ url: "/api/magic-link" }),
		);
		expect(result.current.error).toBe("Fetch error");
	});

	it("handleMagicLinkRequest sets error if email is empty", async () => {
		const { result } = renderHook(() =>
			useMagicLink({ url: "/api/magic-link" }),
		);
		await act(async () => {
			await result.current.handleMagicLinkRequest();
		});
		expect(result.current.error).toBe("Please enter your email address");
		expect(executeMock).not.toHaveBeenCalled();
	});

	it("handleMagicLinkRequest calls execute and disables button on success", async () => {
		// Set the execute function of the mock implementation to return a resolved promise
		mockUseFetch.mockReturnValue({
			data: null,
			loading: false,
			execute: vi.fn().mockResolvedValue(true),
			error: null,
		});
		const { result } = renderHook(() =>
			useMagicLink({ url: "/api/magic-link" }),
		);
		act(() => {
			result.current.setEmail("test@example.com");
		});
		await act(async () => {
			await result.current.handleMagicLinkRequest();
		});
		expect(result.current.isButtonDisabled).toBe(true);
	});

	it("countdown disables and re-enables button", async () => {
		// Enable fake timers
		vi.useFakeTimers();
		// Set the execute function of the mock implementation to return a resolved promise
		mockUseFetch.mockReturnValue({
			data: null,
			loading: false,
			execute: vi.fn().mockResolvedValue(true),
			error: null,
		});
		const { result } = renderHook(() =>
			useMagicLink({ url: "/api/magic-link", initialCountdown: 2 }),
		);
		act(() => {
			result.current.setEmail("test@example.com");
		});
		await act(async () => {
			await result.current.handleMagicLinkRequest();
		});
		expect(result.current.isButtonDisabled).toBe(true);
		expect(result.current.countdown).toBe(2);
		act(() => {
			// Advance the timers by 1000ms
			vi.advanceTimersByTime(1000);
		});
		expect(result.current.countdown).toBe(1);
		act(() => {
			// Advance the timers by 1000ms
			vi.advanceTimersByTime(1000);
		});
		expect(result.current.countdown).toBe(2);
		expect(result.current.isButtonDisabled).toBe(false);
		// Disable fake timers
		vi.useRealTimers();
	});
});
