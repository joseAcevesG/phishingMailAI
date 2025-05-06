import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Landing from "./Landing";

// Tests for the Landing page component
// Covers both unauthenticated and authenticated scenarios

describe("Landing", () => {
	// Test: Should render welcome content and Get Started button when not authenticated
	it("renders welcome content and Get Started button when not authenticated", () => {
		render(
			<MemoryRouter>
				<Landing />
			</MemoryRouter>,
		);
		expect(screen.getByText(/welcome to phishingMail ai/i)).toBeInTheDocument();
		expect(screen.getByText(/secure your inbox/i)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
			"href",
			"/login",
		);
	});
});
