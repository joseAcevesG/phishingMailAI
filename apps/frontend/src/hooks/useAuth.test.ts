import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { FetchConfig } from "../types";
import { useAuth } from "./useAuth";
import { useFetch } from "./useFetch";

// Mock react-router-dom to control navigation
vi.mock("react-router-dom", () => ({
	useNavigate: vi.fn(),
}));

// Mock useFetch to control fetching behavior
vi.mock("./useFetch", () => ({
	useFetch: vi.fn(),
}));

const mockUseFetch = useFetch as unknown as Mock;
const mockUseNavigate = useNavigate as unknown as Mock;

describe("useAuth", () => {
	let fetchStatusMock: Mock;
	let executeLogoutMock: Mock;
	let navigateMock: Mock;

	beforeEach(() => {
		// Reset mocks before each test
		vi.useFakeTimers();
		fetchStatusMock = vi.fn();
		executeLogoutMock = vi.fn();
		navigateMock = vi.fn();
		mockUseFetch.mockImplementation((config: FetchConfig) => {
			if (config.url === "/api/auth/logout") {
				// Mock logout request
				return {
					data: null,
					error: null,
					loading: false,
					execute: executeLogoutMock,
				};
			}
			if (config.url === "/api/auth/status") {
				// Mock status request
				return {
					data: null,
					error: null,
					loading: false,
					execute: fetchStatusMock,
				};
			}
			return { data: null, error: null, loading: false, execute: vi.fn() };
		});
		mockUseNavigate.mockReturnValue(navigateMock);
	});

	it("calls status check immediately and on interval", async () => {
		fetchStatusMock.mockResolvedValue({
			authenticated: true,
			email: "user@example.com",
		});
		await act(async () => {
			renderHook(() => useAuth());
		});
		// Should be called immediately
		expect(fetchStatusMock).toHaveBeenCalledTimes(1);
		// Advance timer by 5 minutes
		await act(async () => {
			vi.advanceTimersByTime(5 * 60 * 1000);
			// Wait for next tick
			await Promise.resolve();
		});
		expect(fetchStatusMock).toHaveBeenCalledTimes(2);
	});

	it("cleans up interval and does not update state after unmount", async () => {
		fetchStatusMock.mockResolvedValue({
			authenticated: true,
			email: "user@example.com",
		});
		const { unmount } = renderHook(() => useAuth());
		await act(async () => {
			await Promise.resolve();
		});
		unmount();
		// Try to advance timer and ensure no further calls or state updates
		await act(async () => {
			vi.advanceTimersByTime(5 * 60 * 1000);
			await Promise.resolve();
		});
		// Should still be called only once (the initial)
		expect(fetchStatusMock).toHaveBeenCalledTimes(1);
		// State should not update after unmount
		// (no error thrown means no setState on unmounted)
	});

	it("sets loading to false after effect", async () => {
		let result: ReturnType<typeof renderHook>["result"] = {} as ReturnType<
			typeof renderHook
		>["result"];
		await act(async () => {
			result = renderHook(() => useAuth()).result;
		});
		type UseAuthReturn = ReturnType<typeof useAuth>;
		const current = result.current as UseAuthReturn;
		expect(current.loading).toBe(false);
	});

	it("sets authenticated state on successful status fetch", async () => {
		fetchStatusMock.mockResolvedValue({
			authenticated: true,
			email: "user@example.com",
		});
		const { result } = renderHook(() => useAuth());
		await act(async () => {
			await Promise.resolve();
		});
		expect(result.current.isAuthenticated).toBe(true);
		expect(result.current.userEmail).toBe("user@example.com");
		expect(result.current.loading).toBe(false);
	});

	it("sets unauthenticated state if status fetch fails", async () => {
		fetchStatusMock.mockResolvedValue(null);
		const { result } = renderHook(() => useAuth());
		await act(async () => {
			await Promise.resolve();
		});
		expect(result.current.isAuthenticated).toBe(false);
		expect(result.current.userEmail).toBe(null);
		expect(result.current.loading).toBe(false);
	});

	it("handleLogout sets unauthenticated state and navigates", async () => {
		executeLogoutMock.mockResolvedValue({});
		const { result } = renderHook(() => useAuth());
		await act(async () => {
			await result.current.handleLogout();
		});
		expect(result.current.isAuthenticated).toBe(false);
		expect(result.current.userEmail).toBe(null);
		expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
	});

	it("handleAuthenticate updates auth state", () => {
		const { result, rerender } = renderHook(() => useAuth());
		act(() => {
			result.current.handleAuthenticate({
				authenticated: true,
				email: "foo@bar.com",
			});
		});
		rerender();
		expect(result.current.isAuthenticated).toBe(true);
		expect(result.current.userEmail).toBe("foo@bar.com");
	});

	// Restore timers after all tests
	afterEach(() => {
		vi.useRealTimers();
	});
});
