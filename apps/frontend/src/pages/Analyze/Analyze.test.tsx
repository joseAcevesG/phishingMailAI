import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Analysis } from "shared";
import Analyze from "./Analyze";
import type * as ReactRouterDOM from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import type { UseFetchReturn } from "src/types";

// Mock useFetch
vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));
const mockUseFetch = useFetch as unknown as Mock;

// Mock ResultView
type ResultViewProps = {
	onReset: () => void;
	result: Analysis;
};
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

vi.mock("react-router-dom", async () => {
	// importActual will return the real module, typed as typeof ReactRouterDOM
	const actual: typeof ReactRouterDOM = await vi.importActual<
		typeof ReactRouterDOM
	>("react-router-dom");

	return {
		...actual,
		useNavigate: () => navigate,
	};
});

// Cast to the real module type via vi.importActual
const navigate = vi.fn();

describe("Analyze page", () => {
	// Create a mock Analysis object with all required fields
	const analysis: Analysis = {
		_id: "1",
		subject: "Test Subject",
		from: "sender@example.com",
		to: "receiver@example.com",
		phishingProbability: 0.1,
		reasons: "Looks suspicious",
		redFlags: ["Urgency", "Unknown sender"],
	};

	const setup = (fetchState: UseFetchReturn<Analysis>) => {
		mockUseFetch.mockReturnValue({ ...fetchState });
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

	it("shows loading state", () => {
		setup({ loading: true, error: null, data: null, execute: vi.fn() });
		expect(screen.getByText(/loading analysis/i)).toBeInTheDocument();
	});

	it("shows error state", () => {
		setup({
			loading: false,
			error: "Something went wrong",
			data: null,
			execute: vi.fn(),
		});
		expect(screen.getByText(/error/i)).toBeInTheDocument();
		expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("shows no analysis found state", () => {
		setup({ loading: false, error: null, data: null, execute: vi.fn() });
		expect(screen.getByText(/no analysis found/i)).toBeInTheDocument();
	});

	it("renders ResultView when analysis is present", () => {
		setup({ loading: false, error: null, data: analysis, execute: vi.fn() });
		expect(screen.getByTestId("result-view")).toBeInTheDocument();
		expect(screen.getByText(analysis.subject)).toBeInTheDocument();
	});

	it("navigates on reset", () => {
		setup({ loading: false, error: null, data: analysis, execute: vi.fn() });
		act(() => {
			screen.getByText("Reset").click();
		});
		expect(navigate).toHaveBeenCalledWith("/");
	});
});
