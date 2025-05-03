import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { Authenticate } from "./Authenticate";
import { useAuthenticate } from "./useAuthenticate";

// Mock the custom hook to verify it's called
vi.mock("./useAuthenticate", () => ({
	useAuthenticate: vi.fn(),
}));
const mockUseAuthenticate = useAuthenticate as unknown as Mock;

describe("Authenticate", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("renders the authenticating message", () => {
		render(<Authenticate onAuthenticate={vi.fn()} />);
		expect(screen.getByText(/authenticating/i)).toBeInTheDocument();
	});

	it("calls useAuthenticate with onAuthenticate", () => {
		const onAuthenticate = vi.fn();
		render(<Authenticate onAuthenticate={onAuthenticate} />);
		expect(mockUseAuthenticate).toHaveBeenCalledWith(onAuthenticate);
	});
});
