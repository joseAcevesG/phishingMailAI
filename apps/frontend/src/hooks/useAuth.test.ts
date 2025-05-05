import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

	it("sets loading to false after effect", async () => {
		// If loading is true, the effect will refetch the status when the component
		// mounts. This test ensures that loading is set to false after the effect
		// has completed.
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
		// If the status fetch is successful, the hook should update the
		// isAuthenticated state and userEmail.
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
		// If the status fetch fails, the hook should update the isAuthenticated
		// state and userEmail.
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
		// When the logout button is clicked, the hook should update the
		// isAuthenticated state and navigate to the login page.
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
		// When the handleAuthenticate function is called, the hook should update the
		// isAuthenticated state and userEmail.
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
});
