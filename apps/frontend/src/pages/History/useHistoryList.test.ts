import { act, renderHook } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "../../hooks/useFetch";
import type { FetchConfig, History } from "../../types";
import { useHistoryList } from "./useHistoryList";

// Mock useFetch to isolate API logic
vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));
const mockUseFetch = useFetch as unknown as Mock;

describe("useHistoryList", () => {
	let fetchHistoryMock: Mock;
	let deleteHistoryMock: Mock;

	// Sample history data for all tests
	const fakeHistory: History[] = [
		{ _id: "1", subject: "A", from: "a@a.com", to: "b@b.com" },
		{ _id: "2", subject: "B", from: "c@c.com", to: "d@d.com" },
	];

	// Reset mocks and set up mock implementations before each test
	beforeEach(() => {
		fetchHistoryMock = vi.fn();
		deleteHistoryMock = vi.fn();
		mockUseFetch.mockImplementation((config: FetchConfig) => {
			if (config.url === "/api/analyze-mail") {
				return {
					data: fakeHistory,
					error: null,
					loading: false,
					execute: fetchHistoryMock,
				};
			}
			if (
				config.url === "/api/analyze-mail/:id" &&
				config.method === "DELETE"
			) {
				return {
					data: null,
					error: null,
					loading: false,
					execute: deleteHistoryMock,
				};
			}
			return { data: null, error: null, loading: false, execute: vi.fn() };
		});
	});

	// Test: Should return historyList, loading, error, and handleDelete
	it("returns historyList, loading, error, and handleDelete", () => {
		const { result } = renderHook(() => useHistoryList());
		expect(result.current.historyList).toEqual(fakeHistory);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe(null);
		expect(typeof result.current.handleDelete).toBe("function");
	});

	// Test: Should remove item optimistically and restore on failure
	it("removes item optimistically and restores on failure", async () => {
		deleteHistoryMock.mockResolvedValueOnce(null);
		const { result } = renderHook(() => useHistoryList());
		expect(result.current.historyList).toHaveLength(2);
		await act(async () => {
			await result.current.handleDelete("1");
		});
		// Should restore the item if delete fails
		expect(result.current.historyList).toHaveLength(2);
		expect(result.current.historyList?.[0]._id).toBe("1");
	});

	// Test: Should remove item from historyList on successful delete
	it("removes item from historyList on success", async () => {
		deleteHistoryMock.mockResolvedValueOnce({ message: "ok" });
		const { result } = renderHook(() => useHistoryList());
		expect(result.current.historyList).toHaveLength(2);
		await act(async () => {
			await result.current.handleDelete("1");
		});
		// Should remove the item with _id "1"
		expect(result.current.historyList).toHaveLength(1);
		expect(result.current.historyList?.[0]._id).toBe("2");
	});
});
