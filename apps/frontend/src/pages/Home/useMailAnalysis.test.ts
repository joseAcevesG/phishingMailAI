import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import type { Analysis } from "shared";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "../../hooks/useFetch";
import { useMailAnalysis } from "./useMailAnalysis";

// Mock useFetch and useNavigate to isolate hook logic from dependencies
vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));
vi.mock("react-router-dom", () => ({
	useNavigate: vi.fn(),
}));

const mockUseFetch = useFetch as unknown as Mock;
const mockUseNavigate = useNavigate as unknown as Mock;

describe("useMailAnalysis", () => {
	// Sample analysis result for testing navigation and return values
	const fakeAnalysis: Analysis = {
		_id: "abc123",
		subject: "Test Subject",
		from: "a@b.com",
		to: "b@c.com",
		phishingProbability: 0.5,
		reasons: "Test reason",
		redFlags: ["flag1"],
	};

	let executeMock: Mock;
	let navigateMock: Mock;

	beforeEach(() => {
		// Reset mocks and set up default return values before each test
		executeMock = vi.fn();
		navigateMock = vi.fn();
		mockUseFetch.mockReturnValue({
			execute: executeMock,
			error: null,
			loading: false,
		});
		mockUseNavigate.mockReturnValue(navigateMock);
	});

	// Test: Hook returns expected structure and functions
	it("returns uploading, error, and functions", () => {
		const { result } = renderHook(() => useMailAnalysis());
		expect(result.current.uploading).toBe(false);
		expect(result.current.error).toBe(null);
		expect(typeof result.current.analyzeEmail).toBe("function");
		expect(typeof result.current.reset).toBe("function");
		expect(typeof result.current.goToSetApiKey).toBe("function");
	});

	// Test: analyzeEmail calls execute and navigates to analysis page on success
	it("calls execute and navigates on analyzeEmail", async () => {
		executeMock.mockResolvedValue(fakeAnalysis);
		const { result } = renderHook(() => useMailAnalysis());
		const file = new File(["dummy"], "test.eml", { type: "message/rfc822" });
		await act(async () => {
			await result.current.analyzeEmail(file);
		});
		expect(executeMock).toHaveBeenCalled();
		expect(navigateMock).toHaveBeenCalledWith(`/analyze/${fakeAnalysis._id}`);
	});

	// Test: Should not navigate if execute returns null
	it("does not navigate if execute returns null", async () => {
		executeMock.mockResolvedValue(null);
		const { result } = renderHook(() => useMailAnalysis());
		const file = new File(["dummy"], "test.eml", { type: "message/rfc822" });
		await act(async () => {
			await result.current.analyzeEmail(file);
		});
		expect(navigateMock).not.toHaveBeenCalled();
	});

	// Test: Should set error when fetch hook returns error
	it("sets error when errorFetch changes", () => {
		mockUseFetch.mockReturnValue({
			execute: executeMock,
			error: "Some error",
			loading: false,
		});
		const { result } = renderHook(() => useMailAnalysis());
		expect(result.current.error).toBe("Some error");
	});

	// Test: Should clear error on reset
	it("reset clears error", () => {
		mockUseFetch.mockReturnValue({
			execute: executeMock,
			error: "Some error",
			loading: false,
		});
		const { result } = renderHook(() => useMailAnalysis());
		act(() => {
			result.current.reset();
		});
		expect(result.current.error).toBe(null);
	});

	// Test: goToSetApiKey navigates to the settings page
	it("goToSetApiKey navigates to /settings", () => {
		const { result } = renderHook(() => useMailAnalysis());
		act(() => {
			result.current.goToSetApiKey();
		});
		expect(navigateMock).toHaveBeenCalledWith("/settings");
	});
});
