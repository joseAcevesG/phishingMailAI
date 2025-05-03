import { renderHook } from "@testing-library/react";
import { useNavigate, useParams } from "react-router-dom";
import type { Analysis } from "shared";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "../../hooks/useFetch";
import { useAnalyze } from "./useAnalyze";

vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));
vi.mock("react-router-dom", () => ({
	useNavigate: vi.fn(),
	useParams: vi.fn(),
}));

const mockUseFetch = useFetch as unknown as Mock;
const mockUseNavigate = useNavigate as unknown as Mock;
const mockUseParams = useParams as unknown as Mock;

describe("useAnalyze", () => {
	const fakeAnalysis: Analysis = {
		_id: "1",
		subject: "Phishing Test",
		from: "foo@bar.com",
		to: "baz@qux.com",
		phishingProbability: 0.42,
		reasons: "Suspicious sender",
		redFlags: ["Urgency", "Link"],
	};

	beforeEach(() => {
		mockUseParams.mockReturnValue({ id: "1" });
		mockUseNavigate.mockReturnValue(vi.fn());
	});

	it("returns loading state initially", () => {
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

	it("returns analysis data when loaded", () => {
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

	it("returns error when fetch fails", () => {
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

	it("calls execute on mount", () => {
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

	it("returns navigate from useNavigate", () => {
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
