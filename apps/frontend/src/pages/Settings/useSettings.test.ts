import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSettings } from "./useSettings";

// Mock dependencies
const mockSaveKey = vi.fn();
const mockLogoutAll = vi.fn();
const mockValidateStatus = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../hooks/useFetch", () => ({
	useFetch: (config: { url: string; method: string }) => {
		if (config.url === "/api/auth/change-trial") {
			return {
				error: null,
				loading: false,
				execute: mockSaveKey,
			};
		}
		if (config.url === "/api/auth/logout-all") {
			return {
				error: null,
				loading: false,
				execute: mockLogoutAll,
			};
		}
		return {};
	},
}));

vi.mock("../../hooks/useAuth", () => ({
	useAuth: () => ({
		validateStatus: mockValidateStatus,
	}),
}));

vi.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
}));

describe("useSettings", () => {
	beforeEach(() => {
		mockSaveKey.mockReset();
		mockLogoutAll.mockReset();
		mockValidateStatus.mockReset();
		mockNavigate.mockReset();
	});

	it("should initialize state and handlers", () => {
		const { result } = renderHook(() => useSettings());
		expect(result.current.apiKey).toBe("");
		expect(typeof result.current.setApiKey).toBe("function");
		expect(result.current.keyError).toBeNull();
		expect(result.current.keyLoading).toBe(false);
		expect(typeof result.current.handleKeySubmit).toBe("function");
		expect(result.current.logoutError).toBeNull();
		expect(result.current.logoutLoading).toBe(false);
		expect(typeof result.current.handleLogoutAll).toBe("function");
	});

	it("should update apiKey state", () => {
		const { result } = renderHook(() => useSettings());
		act(() => {
			result.current.setApiKey("my-api-key");
		});
		expect(result.current.apiKey).toBe("my-api-key");
	});

	it("should call saveKey and navigate on successful key submit", async () => {
		const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
		mockSaveKey.mockResolvedValue({ message: "ok" });
		const { result } = renderHook(() => useSettings());
		act(() => {
			result.current.setApiKey("my-api-key");
		});
		await act(async () => {
			await result.current.handleKeySubmit(fakeEvent);
		});
		expect(mockSaveKey).toHaveBeenCalledWith({
			body: { api_key: "my-api-key" },
		});
		expect(mockNavigate).toHaveBeenCalledWith("/");
	});

	it("should not navigate if saveKey fails", async () => {
		const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
		mockSaveKey.mockResolvedValue(null);
		const { result } = renderHook(() => useSettings());
		act(() => {
			result.current.setApiKey("bad-key");
		});
		await act(async () => {
			await result.current.handleKeySubmit(fakeEvent);
		});
		expect(mockNavigate).not.toHaveBeenCalled();
	});

	it("should call logoutAll, validateStatus, and navigate on successful logout", async () => {
		mockLogoutAll.mockResolvedValue({ message: "logged out" });
		const { result } = renderHook(() => useSettings());
		await act(async () => {
			await result.current.handleLogoutAll();
		});
		expect(mockLogoutAll).toHaveBeenCalled();
		expect(mockValidateStatus).toHaveBeenCalledWith({ authenticated: false });
		expect(mockNavigate).toHaveBeenCalledWith("/login");
	});

	it("should not validateStatus or navigate if logoutAll fails", async () => {
		mockLogoutAll.mockResolvedValue(null);
		const { result } = renderHook(() => useSettings());
		await act(async () => {
			await result.current.handleLogoutAll();
		});
		expect(mockValidateStatus).not.toHaveBeenCalled();
		expect(mockNavigate).not.toHaveBeenCalled();
	});
});
