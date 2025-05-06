import { render, screen } from "@testing-library/react";
import { type Mock, afterEach, describe, expect, it, vi } from "vitest";
import Authenticate from "./Authenticate";
import { useAuthenticate } from "./useAuthenticate";

// Mock the useAuthenticate hook
vi.mock("./useAuthenticate", () => ({
	useAuthenticate: vi.fn(),
}));
// Cast the mocked hook for easier assertions
const mockUseAuthenticate = useAuthenticate as Mock;

describe("Authenticate", () => {
	// Clear all mocks after each test to prevent state leakage
	afterEach(() => {
		vi.clearAllMocks();
	});

	// Test: Should render the authenticating message
	it("renders the authenticating message", () => {
		render(<Authenticate />);
		expect(screen.getByText(/Authenticating.../i)).toBeInTheDocument();
	});

	// Test: Should call useAuthenticate with no arguments
	it("calls useAuthenticate with no arguments", () => {
		render(<Authenticate />);
		expect(mockUseAuthenticate).toHaveBeenCalledWith();
	});
});
