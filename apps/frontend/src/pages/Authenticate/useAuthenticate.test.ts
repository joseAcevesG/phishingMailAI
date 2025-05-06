import { renderHook, waitFor } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthenticate } from "./useAuthenticate";

// Mocks
const mockNavigate = vi.fn();
const mockExecute = vi.fn();
const mockValidateStatus = vi.fn();
const mockSearchParams = { toString: vi.fn() };

// Mock useFetch and useAuth to isolate dependencies
vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));
vi.mock("../../hooks/useAuth", () => ({
	useAuth: vi.fn(),
}));

// Mock react-router-dom to control navigation
vi.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
	useSearchParams: () => [mockSearchParams],
}));

import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
const mockUseFetch = useFetch as unknown as Mock;
const mockUseAuth = useAuth as unknown as Mock;

describe("useAuthenticate", () => {
	// Setup: Clear mocks and define return values for useFetch and useAuth
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseFetch.mockReturnValue({ execute: mockExecute });
		mockUseAuth.mockReturnValue({ validateStatus: mockValidateStatus });
	});

	// Test: Navigates to /login if no query string is present
	it("navigates to /login if query string is empty", () => {
		mockSearchParams.toString.mockReturnValue("");
		renderHook(() => useAuthenticate());
		expect(mockNavigate).toHaveBeenCalledWith("/login");
		expect(mockExecute).not.toHaveBeenCalled();
	});

	// Test: Calls execute with correct URL when query string exists
	it("calls execute with correct url if query string exists", async () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		mockExecute.mockResolvedValueOnce({});
		renderHook(() => useAuthenticate());
		// Wait for the hook to finish executing
		await Promise.resolve();
		expect(mockExecute).toHaveBeenCalledWith({
			url: "/api/auth/authenticate?token=abc",
		});
	});

	// Test: Calls validateStatus if authentication succeeds
	it("calls validateStatus if authentication succeeds", async () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		const result = { user: "test" };
		mockExecute.mockResolvedValueOnce(result);
		renderHook(() => useAuthenticate());
		// Wait for the hook to finish executing
		await Promise.resolve();
		expect(mockValidateStatus).toHaveBeenCalledWith(result);
	});

	// Test: Navigates to /login if authentication fails (returns null)
	it("navigates to /login if authentication fails", async () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		mockExecute.mockResolvedValueOnce(null);
		renderHook(() => useAuthenticate());
		// Wait for the hook to finish executing
		await Promise.resolve();
		expect(mockNavigate).toHaveBeenCalledWith("/login");
	});

	// Test: Navigates to /login if authentication throws an error
	it("navigates to /login if authentication throws", async () => {
		// Simulate a query string with a token
		mockSearchParams.toString.mockReturnValue("token=abc");
		mockExecute.mockRejectedValueOnce(new Error("fail"));
		renderHook(() => useAuthenticate());
		// Wait for the hook to finish executing and navigation to occur
		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/login");
		});
	});
});
