import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import SignUp from "./SignUp";

// Type definitions for mocked components
// (These help TypeScript understand the props for the mocks)
type ToggleButtonGroupProps = {
	selectedMethod: "magic" | "password";
	setSelectedMethod: (method: "magic" | "password") => void;
};

type MagicLinkProps = {
	buttonText: string;
	url: string;
};

// Mock ToggleButtonGroup to control signup method selection UI
vi.mock("../../components/ToggleButtonGroup/ToggleButtonGroup", () => ({
	__esModule: true,
	default: ({ selectedMethod, setSelectedMethod }: ToggleButtonGroupProps) => (
		<div data-testid="toggle-group">
			<button onClick={() => setSelectedMethod("magic")} type="button">
				Magic
			</button>
			<button onClick={() => setSelectedMethod("password")} type="button">
				Password
			</button>
			<span>{selectedMethod}</span>
		</div>
	),
}));
// Mock MagicLink to simulate the magic link signup flow
vi.mock("../../components/magicLink/MagicLink", () => ({
	__esModule: true,
	default: (props: MagicLinkProps) => (
		<button data-testid="magic-link" type="button">
			{props.buttonText}
		</button>
	),
}));
// Mock Password form to simulate the password signup flow
vi.mock("./Password", () => ({
	__esModule: true,
	default: () => <div data-testid="password-form">PasswordForm</div>,
}));

describe("<SignUp />", () => {
	// Test: Should render welcome message and toggle group
	it("renders welcome message and toggle group", () => {
		render(<SignUp />, { wrapper: MemoryRouter });
		expect(
			screen.getByText(/welcome to phishing mail ai/i),
		).toBeInTheDocument();
		expect(screen.getByTestId("toggle-group")).toBeInTheDocument();
	});

	// Test: Should show MagicLink by default and switch to Password on toggle
	it("shows MagicLink by default and switches to Password on toggle", () => {
		render(<SignUp />, { wrapper: MemoryRouter });
		expect(screen.getByTestId("magic-link")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Password"));
		expect(screen.getByTestId("password-form")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Magic"));
		expect(screen.getByTestId("magic-link")).toBeInTheDocument();
	});

	// Test: Should show login link for existing users
	it("shows login link", () => {
		render(<SignUp />, { wrapper: MemoryRouter });
		expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
	});
});
