import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { useFetch } from "../../hooks/useFetch";
import { useSettings } from "./useSettings";

// Mock react-router-dom for navigation
vi.mock("react-router-dom", () => ({
	useNavigate: () => vi.fn(),
}));

// Mock useFetch to control API call behavior for API key and logout
vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));

describe("useSettings", () => {
	// Reset useFetch mock before each test for isolation
	beforeEach(() => {
		(useFetch as Mock).mockReset();
	});

	// Test: Should initialize with correct default state
	it("initializes with correct default state", () => {
		(useFetch as Mock)
			.mockReturnValueOnce({
				execute: vi.fn(),
				error: null,
				loading: false,
			})
			.mockReturnValueOnce({
				execute: vi.fn(),
				error: null,
				loading: false,
			});
		const { result } = renderHook(() => useSettings());
		expect(result.current.apiKey).toBe("");
		expect(result.current.keyError).toBeNull();
		expect(result.current.keyLoading).toBe(false);
		expect(result.current.logoutError).toBeNull();
		expect(result.current.logoutLoading).toBe(false);
	});

	// Test: Should update apiKey state
	it("updates apiKey", () => {
		(useFetch as Mock).mockReturnValue({
			execute: vi.fn(),
			error: null,
			loading: false,
		});
		const { result } = renderHook(() => useSettings());
		act(() => {
			result.current.setApiKey("sk-test");
		});
		expect(result.current.apiKey).toBe("sk-test");
	});

	// Test: Should submit API key and navigate on success
	it("submits API key and navigates on success", async () => {
		const saveKey = vi.fn().mockResolvedValue({ success: true });
		const navigate = vi.fn();
		(useFetch as Mock)
			.mockReturnValueOnce({
				execute: saveKey,
				error: null,
				loading: false,
			})
			.mockReturnValueOnce({
				execute: vi.fn(),
				error: null,
				loading: false,
			});
		const routerDom = await import("react-router-dom");
		(
			routerDom as unknown as { useNavigate: () => typeof navigate }
		).useNavigate = () => navigate;
		(useFetch as Mock)
			.mockReturnValueOnce({
				execute: saveKey,
				error: null,
				loading: false,
			})
			.mockReturnValueOnce({
				execute: vi.fn(),
				error: null,
				loading: false,
			});
		const { result } = renderHook(() => useSettings());
		act(() => {
			result.current.setApiKey("sk-test");
		});
		const fakeEvent = {
			preventDefault: () => {},
		} as unknown as React.FormEvent<HTMLFormElement>;
		await act(async () => {
			await result.current.handleKeySubmit(fakeEvent);
		});
		expect(saveKey).toHaveBeenCalledWith({ body: { api_key: "sk-test" } });
		expect(navigate).toHaveBeenCalledWith("/");
	});

	// Test: Should log out everywhere and navigate on success
	it("logs out everywhere and navigates on success", async () => {
		const logoutAll = vi.fn().mockResolvedValue({ success: true });
		const navigate = vi.fn();
		(useFetch as Mock)
			.mockReturnValueOnce({
				execute: vi.fn(),
				error: null,
				loading: false,
			})
			.mockReturnValueOnce({
				execute: logoutAll,
				error: null,
				loading: false,
			});
		const routerDom = await import("react-router-dom");
		(
			routerDom as unknown as { useNavigate: () => typeof navigate }
		).useNavigate = () => navigate;
		const { result } = renderHook(() => useSettings());
		await act(async () => {
			await result.current.handleLogoutAll();
		});
		expect(logoutAll).toHaveBeenCalled();
		expect(navigate).toHaveBeenCalledWith("/login");
	});
});
