import { renderHook, waitFor } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "../../hooks/useFetch";
import type { APIAuth } from "../../types";
import { useAuthenticate } from "./useAuthenticate";

// Mock useFetch to isolate API logic
vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));
const mockUseFetch = useFetch as unknown as Mock;
const mockNavigate = vi.fn();
const mockExecute = vi.fn();
const mockSearchParams = { toString: vi.fn() };

// Mock react-router-dom hooks for navigation and query params
vi.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
	useSearchParams: () => [mockSearchParams],
}));

describe("useAuthenticate", () => {
	// Reset mocks before each test and set default useFetch implementation
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseFetch.mockImplementation(() => ({ execute: mockExecute }));
	});

	// Test: Should navigate to /login if query string is empty
	it("navigates to /login if query string is empty", () => {
		mockSearchParams.toString.mockReturnValue("");
		const onAuthenticate = vi.fn();
		renderHook(() => useAuthenticate(onAuthenticate));
		expect(mockNavigate).toHaveBeenCalledWith("/login");
		expect(mockExecute).not.toHaveBeenCalled();
	});

	// Test: Should call execute with correct URL if query string exists
	it("calls execute with correct url if query string exists", () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		mockExecute.mockResolvedValueOnce({});
		const onAuthenticate = vi.fn();
		renderHook(() => useAuthenticate(onAuthenticate));
		expect(mockExecute).toHaveBeenCalledWith({
			url: "/api/auth/authenticate?token=abc",
		});
	});

	// Test: Should call onAuthenticate callback if result is returned
	it("calls onAuthenticate if result is returned", async () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		const fakeResult = { user: "test" } as unknown as APIAuth;
		mockExecute.mockResolvedValueOnce(fakeResult);
		const onAuthenticate = vi.fn();
		renderHook(() => useAuthenticate(onAuthenticate));
		await Promise.resolve();
		expect(onAuthenticate).toHaveBeenCalledWith(fakeResult);
	});

	// Test: Should navigate to /login if result is falsy
	it("navigates to /login if result is falsy", async () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		mockExecute.mockResolvedValueOnce(null);
		const onAuthenticate = vi.fn();
		renderHook(() => useAuthenticate(onAuthenticate));
		await Promise.resolve();
		expect(mockNavigate).toHaveBeenCalledWith("/login");
	});

	// Test: Should navigate to /login on execute error
	it("navigates to /login on execute error", async () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		mockExecute.mockRejectedValueOnce(new Error("fail"));
		const onAuthenticate = vi.fn();
		renderHook(() => useAuthenticate(onAuthenticate));
		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/login");
		});
	});
});
