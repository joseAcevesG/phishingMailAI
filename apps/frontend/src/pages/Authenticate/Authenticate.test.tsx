import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { Authenticate } from "./Authenticate";
import { useAuthenticate } from "./useAuthenticate";

// Mock the useAuthenticate hook to isolate component logic from authentication logic
vi.mock("./useAuthenticate", () => ({
	useAuthenticate: vi.fn(),
}));
// Cast the mocked hook for easier assertions
const mockUseAuthenticate = useAuthenticate as unknown as Mock;

describe("Authenticate", () => {
	// Clear all mocks after each test to prevent state leakage
	afterEach(() => {
		vi.clearAllMocks();
	});

	// Test: Should render the authenticating message
	it("renders the authenticating message", () => {
		render(<Authenticate onAuthenticate={vi.fn()} />);
		expect(screen.getByText(/authenticating/i)).toBeInTheDocument();
	});

	// Test: Should call useAuthenticate with the onAuthenticate callback
	it("calls useAuthenticate with onAuthenticate", () => {
		const onAuthenticate = vi.fn();
		render(<Authenticate onAuthenticate={onAuthenticate} />);
		expect(mockUseAuthenticate).toHaveBeenCalledWith(onAuthenticate);
	});
});
