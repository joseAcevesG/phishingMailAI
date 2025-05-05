import { render, screen } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import type { History } from "../../types";
import HistoryPage from "./History";
import { useHistoryList } from "./useHistoryList";

// Mock CSS module to avoid style-related errors in tests
vi.mock("./History.module.css", () => ({
	default: { container: "container", table: "table" },
}));

// Mock HistoryRow to control row rendering and simplify assertions
vi.mock("./HistoryRow", () => ({
	__esModule: true,
	default: ({ item }: { item: History }) => (
		<tr data-testid="history-row">
			<td>{item.subject}</td>
			<td>{item.from}</td>
			<td>{item.to}</td>
			<td>Action</td>
		</tr>
	),
}));

// Mock react-router-dom navigation
vi.mock("react-router-dom", () => ({
	useNavigate: () => vi.fn(),
}));

// Define the return type for the useHistoryList mock
interface UseHistoryListReturn {
	historyList: History[];
	loading: boolean;
	error: string | null;
	handleDelete: () => void;
}

// Helper to mock useHistoryList hook with custom state
function mockUseHistoryList({
	historyList = [],
	loading = false,
	error = null,
	handleDelete = vi.fn(),
}: Partial<UseHistoryListReturn> = {}) {
	(useHistoryList as unknown as Mock).mockImplementation(() => ({
		historyList,
		loading,
		error,
		handleDelete,
	}));
}

// Mock the useHistoryList hook
vi.mock("./useHistoryList", () => ({
	useHistoryList: vi.fn(),
}));

describe("HistoryPage", () => {
	// Clear mocks before each test to prevent state leakage
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test: Should render loading state
	it("renders loading state", () => {
		mockUseHistoryList({ loading: true });
		render(<HistoryPage />);
		expect(screen.getByText("Loading history...")).toBeInTheDocument();
	});

	// Test: Should render error state
	it("renders error state", () => {
		mockUseHistoryList({ error: "Some error" });
		render(<HistoryPage />);
		expect(screen.getByText("Error: Some error")).toBeInTheDocument();
	});

	// Test: Should render empty state when no history exists
	it("renders empty state", () => {
		mockUseHistoryList({ historyList: [] });
		render(<HistoryPage />);
		expect(screen.getByText("No history found.")).toBeInTheDocument();
	});

	// Test: Should render table with history rows when data exists
	it("renders table with history rows", () => {
		const historyList: History[] = [
			{ _id: "1", subject: "Test1", from: "a@a.com", to: "b@b.com" },
			{ _id: "2", subject: "Test2", from: "c@c.com", to: "d@d.com" },
		];
		mockUseHistoryList({ historyList });
		render(<HistoryPage />);
		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getAllByTestId("history-row")).toHaveLength(2);
		expect(screen.getByText("Test1")).toBeInTheDocument();
		expect(screen.getByText("Test2")).toBeInTheDocument();
	});
});
