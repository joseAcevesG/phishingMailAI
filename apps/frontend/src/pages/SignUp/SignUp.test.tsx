import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SignUp } from "./SignUp";

type ToggleButtonGroupProps = {
	selectedMethod: "magic" | "password";
	setSelectedMethod: (method: "magic" | "password") => void;
};

type MagicLinkProps = {
	buttonText: string;
	url: string;
};

vi.mock("../../components/ToggleButtonGroup/ToggleButtonGroup", () => ({
	__esModule: true,
	default: ({ selectedMethod, setSelectedMethod }: ToggleButtonGroupProps) => (
		<div data-testid="toggle-group">
			<button type="button" onClick={() => setSelectedMethod("magic")}>
				Magic
			</button>
			<button type="button" onClick={() => setSelectedMethod("password")}>
				Password
			</button>
			<span>{selectedMethod}</span>
		</div>
	),
}));
vi.mock("../../components/magicLink/MagicLink", () => ({
	__esModule: true,
	default: (props: MagicLinkProps) => (
		<button type="button" data-testid="magic-link">
			{props.buttonText}
		</button>
	),
}));
vi.mock("./Password", () => ({
	__esModule: true,
	default: () => <div data-testid="password-form">PasswordForm</div>,
}));

describe("<SignUp />", () => {
	it("renders welcome message and toggle group", () => {
		render(<SignUp onAuthenticate={vi.fn()} />, { wrapper: MemoryRouter });
		expect(
			screen.getByText(/welcome to phishing mail ai/i)
		).toBeInTheDocument();
		expect(screen.getByTestId("toggle-group")).toBeInTheDocument();
	});

	it("shows MagicLink by default and switches to Password on toggle", () => {
		render(<SignUp onAuthenticate={vi.fn()} />, { wrapper: MemoryRouter });
		expect(screen.getByTestId("magic-link")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Password"));
		expect(screen.getByTestId("password-form")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Magic"));
		expect(screen.getByTestId("magic-link")).toBeInTheDocument();
	});

	it("shows login link", () => {
		render(<SignUp onAuthenticate={vi.fn()} />, { wrapper: MemoryRouter });
		expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
	});

	it("redirects if isAuthenticated is true", () => {
		const { container } = render(
			<SignUp isAuthenticated={true} onAuthenticate={vi.fn()} />,
			{ wrapper: MemoryRouter }
		);
		expect(container.innerHTML).toBe("");
	});
});
