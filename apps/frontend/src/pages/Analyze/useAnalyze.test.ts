import { renderHook } from "@testing-library/react";
import { useNavigate, useParams } from "react-router-dom";
import type { Analysis } from "shared";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "../../hooks/useFetch";
import { useAnalyze } from "./useAnalyze";

// Mock useFetch and react-router-dom hooks to isolate dependencies
vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));
vi.mock("react-router-dom", () => ({
	useNavigate: vi.fn(),
	useParams: vi.fn(),
}));

// Cast the mocked hooks for easier usage in tests
const mockUseFetch = useFetch as unknown as Mock;
const mockUseNavigate = useNavigate as unknown as Mock;
const mockUseParams = useParams as unknown as Mock;

describe("useAnalyze", () => {
	// Sample analysis data to be used in tests
	const fakeAnalysis: Analysis = {
		_id: "1",
		subject: "Phishing Test",
		from: "foo@bar.com",
		to: "baz@qux.com",
		phishingProbability: 0.42,
		reasons: "Suspicious sender",
		redFlags: ["Urgency", "Link"],
	};

	// Reset mocks before each test and set default return values
	beforeEach(() => {
		mockUseParams.mockReturnValue({ id: "1" });
		mockUseNavigate.mockReturnValue(vi.fn());
	});

	// Test: Should return loading state initially
	it("returns loading state initially", () => {
		// Mock useFetch to return loading state
		mockUseFetch.mockReturnValue({
			data: null,
			error: null,
			loading: true,
			execute: vi.fn(),
		});
		const { result } = renderHook(() => useAnalyze());
		expect(result.current.loading).toBe(true);
		expect(result.current.analysis).toBe(null);
		expect(result.current.error).toBe(null);
	});

	// Test: Should return analysis data when loaded
	it("returns analysis data when loaded", () => {
		// Mock useFetch to return sample analysis data
		mockUseFetch.mockReturnValue({
			data: fakeAnalysis,
			error: null,
			loading: false,
			execute: vi.fn(),
		});
		const { result } = renderHook(() => useAnalyze());
		expect(result.current.analysis).toEqual(fakeAnalysis);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe(null);
	});

	// Test: Should return error when fetch fails
	it("returns error when fetch fails", () => {
		// Mock useFetch to return error
		mockUseFetch.mockReturnValue({
			data: null,
			error: "Network error",
			loading: false,
			execute: vi.fn(),
		});
		const { result } = renderHook(() => useAnalyze());
		expect(result.current.error).toBe("Network error");
		expect(result.current.analysis).toBe(null);
		expect(result.current.loading).toBe(false);
	});

	// Test: Should call execute on mount
	it("calls execute on mount", () => {
		// Mock useFetch to track execute calls
		const execute = vi.fn();
		mockUseFetch.mockReturnValue({
			data: null,
			error: null,
			loading: true,
			execute,
		});
		renderHook(() => useAnalyze());
		expect(execute).toHaveBeenCalled();
	});

	// Test: Should return navigate function from useNavigate
	it("returns navigate from useNavigate", () => {
		// Mock useNavigate to return navigate function
		const navigate = vi.fn();
		mockUseNavigate.mockReturnValue(navigate);
		mockUseFetch.mockReturnValue({
			data: null,
			error: null,
			loading: true,
			execute: vi.fn(),
		});
		const { result } = renderHook(() => useAnalyze());
		expect(result.current.navigate).toBe(navigate);
	});
});
