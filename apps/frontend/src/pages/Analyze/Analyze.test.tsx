import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Analysis } from "shared";
import Analyze from "./Analyze";
import { useAnalyze } from "./useAnalyze";

// Mock the useAnalyze hook
vi.mock("./useAnalyze", () => ({
	useAnalyze: vi.fn(),
}));
const mockUseAnalyze = useAnalyze as unknown as Mock;

// Mock the ResultView component
type ResultViewProps = {
	onReset: () => void;
	result: Analysis;
};

// Mock the ResultView component
vi.mock("./ResultView", () => ({
	ResultView: ({ onReset, result }: ResultViewProps) => (
		<div data-testid="result-view">
			<span>{result ? result.subject : "No result"}</span>
			<button type="button" onClick={onReset}>
				Reset
			</button>
		</div>
	),
}));

const navigate = vi.fn();

// Mock the navigate function
describe("Analyze page", () => {
	const analysis: Analysis = {
		_id: "1",
		subject: "Test Subject",
		from: "sender@example.com",
		to: "receiver@example.com",
		phishingProbability: 0.1,
		reasons: "Looks suspicious",
		redFlags: ["Urgency", "Unknown sender"],
	};

	/**
	 * Set up the Analyze page component with the given state from the
	 * useAnalyze hook.
	 *
	 * @param {Partial<ReturnType<typeof useAnalyze>>} hookState
	 * The state to return from the useAnalyze hook.
	 * @returns {RenderResult}
	 * The result of rendering the Analyze page component.
	 */
	const setup = (hookState: Partial<ReturnType<typeof useAnalyze>>) => {
		mockUseAnalyze.mockReturnValue({
			analysis: null,
			error: null,
			loading: false,
			navigate,
			...hookState,
		});
		window.history.pushState({}, "", "/analyze/123");
		return render(
			<MemoryRouter initialEntries={["/analyze/123"]}>
				<Routes>
					<Route path="/analyze/:id" element={<Analyze />} />
				</Routes>
			</MemoryRouter>
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test that the component shows the loading state when loading is true
	it("shows loading state", () => {
		setup({ loading: true });
		expect(screen.getByText(/loading analysis/i)).toBeInTheDocument();
	});

	// Test that the component shows the error state when error is not null
	it("shows error state", () => {
		setup({ loading: false, error: "Something went wrong" });
		expect(screen.getByText(/error/i)).toBeInTheDocument();
		expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
	});

	// Test that the component shows the no analysis found state when analysis is null
	it("shows no analysis found state", () => {
		setup({ loading: false, analysis: null });
		expect(screen.getByText(/no analysis found/i)).toBeInTheDocument();
	});

	// Test that the component renders the ResultView when analysis is present
	it("renders ResultView when analysis is present", () => {
		setup({ loading: false, analysis });
		expect(screen.getByTestId("result-view")).toBeInTheDocument();
		expect(screen.getByText(analysis.subject)).toBeInTheDocument();
	});

	// Test that the component navigates to the home page when reset is clicked
	it("navigates on reset", () => {
		setup({ loading: false, analysis });
		act(() => {
			screen.getByText("Reset").click();
		});
		expect(navigate).toHaveBeenCalledWith("/");
	});
});
