import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockedFunction } from "vitest";
import type { FetchConfig } from "../types";
import { useAuth } from "./useAuth";

// Mocks
vi.mock("react-router-dom", () => ({
	useNavigate: vi.fn(),
}));
vi.mock("./useFetch", () => ({
	useFetch: vi.fn(),
}));

import { useNavigate } from "react-router-dom";
import { useFetch } from "./useFetch";

type MockFetch = MockedFunction<typeof useFetch>;
type MockNavigate = MockedFunction<typeof useNavigate>;

describe("useAuth", () => {
	let fetchStatusMock: ReturnType<typeof vi.fn>;
	let executeLogoutMock: ReturnType<typeof vi.fn>;
	let navigateMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchStatusMock = vi.fn();
		executeLogoutMock = vi.fn();
		navigateMock = vi.fn();
		(useFetch as MockFetch).mockImplementation((config: FetchConfig) => {
			if (config.url === "/api/auth/logout") {
				return {
					data: null,
					error: null,
					loading: false,
					execute: executeLogoutMock,
				};
			}
			if (config.url === "/api/auth/status") {
				return {
					data: null,
					error: null,
					loading: false,
					execute: fetchStatusMock,
				};
			}
			return { data: null, error: null, loading: false, execute: vi.fn() };
		});
		(useNavigate as MockNavigate).mockReturnValue(navigateMock);
	});

	it("initializes with loading true", () => {
		const { result } = renderHook(() => useAuth());
		expect(result.current.loading).toBe(true);
	});

	it("sets authenticated state on successful status fetch", async () => {
		fetchStatusMock.mockResolvedValue({
			authenticated: true,
			email: "user@example.com",
		});
		const { result } = renderHook(() => useAuth());
		await act(async () => {
			await Promise.resolve(); // flush effect
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
		const { result } = renderHook(() => useAuth());
		act(() => {
			result.current.handleAuthenticate({
				authenticated: true,
				email: "foo@bar.com",
			});
		});
		expect(result.current.isAuthenticated).toBe(true);
		expect(result.current.userEmail).toBe("foo@bar.com");
	});
});
