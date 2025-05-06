import { renderHook, waitFor } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthenticate } from "./useAuthenticate";

// Mocks
const mockNavigate = vi.fn();
const mockExecute = vi.fn();
const mockValidateStatus = vi.fn();
const mockSearchParams = { toString: vi.fn() };

// Mock useFetch and useAuth
vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));
vi.mock("../../hooks/useAuth", () => ({
	useAuth: vi.fn(),
}));

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
	useSearchParams: () => [mockSearchParams],
}));

import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
const mockUseFetch = useFetch as unknown as Mock;
const mockUseAuth = useAuth as unknown as Mock;

describe("useAuthenticate", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseFetch.mockReturnValue({ execute: mockExecute });
		mockUseAuth.mockReturnValue({ validateStatus: mockValidateStatus });
	});

	it("navigates to /login if query string is empty", () => {
		mockSearchParams.toString.mockReturnValue("");
		renderHook(() => useAuthenticate());
		expect(mockNavigate).toHaveBeenCalledWith("/login");
		expect(mockExecute).not.toHaveBeenCalled();
	});

	it("calls execute with correct url if query string exists", async () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		mockExecute.mockResolvedValueOnce({});
		renderHook(() => useAuthenticate());
		await Promise.resolve();
		expect(mockExecute).toHaveBeenCalledWith({
			url: "/api/auth/authenticate?token=abc",
		});
	});

	it("calls validateStatus if authentication succeeds", async () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		const result = { user: "test" };
		mockExecute.mockResolvedValueOnce(result);
		renderHook(() => useAuthenticate());
		await Promise.resolve();
		expect(mockValidateStatus).toHaveBeenCalledWith(result);
	});

	it("navigates to /login if authentication fails", async () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		mockExecute.mockResolvedValueOnce(null);
		renderHook(() => useAuthenticate());
		await Promise.resolve();
		expect(mockNavigate).toHaveBeenCalledWith("/login");
	});

	it("navigates to /login if authentication throws", async () => {
		mockSearchParams.toString.mockReturnValue("token=abc");
		mockExecute.mockRejectedValueOnce(new Error("fail"));
		renderHook(() => useAuthenticate());
		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/login");
		});
	});
});
