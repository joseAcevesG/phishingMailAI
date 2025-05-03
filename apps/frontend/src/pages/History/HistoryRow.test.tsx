import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HistoryRow from "./HistoryRow";
import type { History } from "../../types";

// Mock CSS module
vi.mock("./History.module.css", () => ({
	default: { actions: "actions", deleteButton: "deleteButton" },
}));

// Mock TrashIcon
vi.mock("../../assets/icons/trash", () => ({
	__esModule: true,
	default: () => <svg data-testid="trash-icon" />,
}));

describe("HistoryRow", () => {
	const item: History = {
		_id: "1",
		subject: "Test Subject",
		from: "from@example.com",
		to: "to@example.com",
	};

	it("renders all fields and buttons", () => {
		const handleDelete = vi.fn();
		const navigate = vi.fn();
		render(
			<table>
				<tbody>
					<HistoryRow
						item={item}
						handleDelete={handleDelete}
						navigate={navigate}
					/>
				</tbody>
			</table>
		);
		expect(screen.getByText("Test Subject")).toBeInTheDocument();
		expect(screen.getByText("from@example.com")).toBeInTheDocument();
		expect(screen.getByText("to@example.com")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /view/i })).toBeInTheDocument();
		expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
	});

	it("calls handleDelete with item._id when delete button is clicked", () => {
		const handleDelete = vi.fn();
		const navigate = vi.fn();
		render(
			<table>
				<tbody>
					<HistoryRow
						item={item}
						handleDelete={handleDelete}
						navigate={navigate}
					/>
				</tbody>
			</table>
		);
		fireEvent.click(screen.getByRole("button", { name: /delete/i }));
		expect(handleDelete).toHaveBeenCalledWith("1");
	});

	it("calls navigate with /analyze/{id} when view button is clicked", () => {
		const handleDelete = vi.fn();
		const navigate = vi.fn();
		render(
			<table>
				<tbody>
					<HistoryRow
						item={item}
						handleDelete={handleDelete}
						navigate={navigate}
					/>
				</tbody>
			</table>
		);
		fireEvent.click(screen.getByRole("button", { name: /view/i }));
		expect(navigate).toHaveBeenCalledWith("/analyze/1");
	});
});
