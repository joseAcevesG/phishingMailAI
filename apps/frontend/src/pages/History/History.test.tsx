import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import HistoryPage from "./History";
import type { History } from "../../types";
import { useHistoryList } from "./useHistoryList";

// Mock CSS module
vi.mock("./History.module.css", () => ({
	default: { container: "container", table: "table" },
}));

// Mock HistoryRow
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

vi.mock("react-router-dom", () => ({
	useNavigate: () => vi.fn(),
}));

interface UseHistoryListReturn {
	historyList: History[];
	loading: boolean;
	error: string | null;
	handleDelete: () => void;
}

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

vi.mock("./useHistoryList", () => ({
	useHistoryList: vi.fn(),
}));

describe("HistoryPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders loading state", () => {
		mockUseHistoryList({ loading: true });
		render(<HistoryPage />);
		expect(screen.getByText("Loading history...")).toBeInTheDocument();
	});

	it("renders error state", () => {
		mockUseHistoryList({ error: "Some error" });
		render(<HistoryPage />);
		expect(screen.getByText("Error: Some error")).toBeInTheDocument();
	});

	it("renders empty state", () => {
		mockUseHistoryList({ historyList: [] });
		render(<HistoryPage />);
		expect(screen.getByText("No history found.")).toBeInTheDocument();
	});

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
