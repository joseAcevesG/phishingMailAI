import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResultView } from "./ResultView";
import type { Analysis } from "shared";

// Sample analysis object to be used in tests
const sampleAnalysis: Analysis = {
	_id: "abc123",
	subject: "Suspicious Email",
	from: "attacker@example.com",
	to: "victim@example.com",
	phishingProbability: 0.85,
	reasons: "Contains suspicious links and urgent language.",
	redFlags: ["Urgency", "Unknown sender"],
};

// Grouping all ResultView tests
describe("ResultView", () => {
	// Test that all fields of the analysis are rendered correctly
	it("renders all analysis fields", () => {
		render(<ResultView result={sampleAnalysis} onReset={vi.fn()} />);
		expect(screen.getByText("Analysis Result")).toBeInTheDocument();
		expect(screen.getByText(/Suspicious Email/)).toBeInTheDocument();
		expect(screen.getByText(/attacker@example.com/)).toBeInTheDocument();
		expect(screen.getByText(/victim@example.com/)).toBeInTheDocument();
		expect(screen.getByText(/85.0%/)).toBeInTheDocument();
		expect(
			screen.getByText(/Contains suspicious links and urgent language./)
		).toBeInTheDocument();
		expect(screen.getByText("Red Flags:")).toBeInTheDocument();
		expect(screen.getByText("Urgency")).toBeInTheDocument();
		expect(screen.getByText("Unknown sender")).toBeInTheDocument();
	});

	// Test that clicking the button calls the onReset callback
	it("calls onReset when button is clicked", () => {
		const onReset = vi.fn();
		render(<ResultView result={sampleAnalysis} onReset={onReset} />);
		const button = screen.getByRole("button", {
			name: /analyze another email/i,
		});
		fireEvent.click(button);
		expect(onReset).toHaveBeenCalled();
	});

	// Test that red flags section is not rendered if redFlags is empty
	it("does not render red flags section if empty", () => {
		const noRedFlags: Analysis = { ...sampleAnalysis, redFlags: [] };
		render(<ResultView result={noRedFlags} onReset={vi.fn()} />);
		expect(screen.queryByText("Red Flags:")).not.toBeInTheDocument();
	});
});
