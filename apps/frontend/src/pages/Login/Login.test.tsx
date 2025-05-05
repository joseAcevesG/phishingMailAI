import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Login } from "./Login";

// Mock ToggleButtonGroup to control login method selection
vi.mock("../../components/ToggleButtonGroup/ToggleButtonGroup", () => ({
	__esModule: true,
	default: ({
		selectedMethod,
		setSelectedMethod,
	}: {
		selectedMethod: string;
		setSelectedMethod: (v: string) => void;
	}) => (
		<div>
			<button onClick={() => setSelectedMethod("magic")} type="button">
				Magic
			</button>
			<button onClick={() => setSelectedMethod("password")} type="button">
				Password
			</button>
			<span data-testid="selected-method">{selectedMethod}</span>
		</div>
	),
}));

// Mock MagicLink login component
vi.mock("../../components/magicLink/MagicLink", () => ({
	__esModule: true,
	default: ({ buttonText }: { buttonText: string }) => (
		<button type="button">{buttonText}</button>
	),
}));

// Mock Password login component
vi.mock("./Password", () => ({
	__esModule: true,
	default: ({
		onAuthenticate,
	}: {
		onAuthenticate: (data: { token: string }) => void;
	}) => (
		<button onClick={() => onAuthenticate({ token: "test" })} type="button">
			Password Login
		</button>
	),
}));

// Tests for the Login page covering authentication methods and redirect

describe("Login", () => {
	const onAuthenticate = vi.fn();

	// Test: Should render magic link login by default and allow switching to password
	it("renders magic link login by default and switches to password", () => {
		render(
			<MemoryRouter>
				<Login isAuthenticated={false} onAuthenticate={onAuthenticate} />
			</MemoryRouter>,
		);
		expect(
			screen.getByText(/welcome to phishing mail ai/i),
		).toBeInTheDocument();
		expect(screen.getByText(/please log in to continue/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /login with magic link/i }),
		).toBeInTheDocument();
		fireEvent.click(screen.getByText("Password"));
		expect(
			screen.getByRole("button", { name: /password login/i }),
		).toBeInTheDocument();
		fireEvent.click(screen.getByText("Magic"));
		expect(
			screen.getByRole("button", { name: /login with magic link/i }),
		).toBeInTheDocument();
	});

	// Test: Should show forgot password link only for password method
	it("shows forgot password link only for password method", () => {
		render(
			<MemoryRouter>
				<Login isAuthenticated={false} onAuthenticate={onAuthenticate} />
			</MemoryRouter>,
		);
		expect(screen.queryByText(/forgot your password/i)).not.toBeInTheDocument();
		fireEvent.click(screen.getByText("Password"));
		expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
	});

	// Test: Should always show signup link
	it("shows signup link always", () => {
		render(
			<MemoryRouter>
				<Login isAuthenticated={false} onAuthenticate={onAuthenticate} />
			</MemoryRouter>,
		);
		expect(screen.getByText(/don't have an account/i)).toHaveAttribute(
			"href",
			"/signup",
		);
	});

	// Test: Should redirect to / if already authenticated
	it("redirects to / if authenticated", () => {
		render(
			<MemoryRouter>
				<Login isAuthenticated={true} onAuthenticate={onAuthenticate} />
			</MemoryRouter>,
		);
		expect(
			screen.queryByText(/welcome to phishing mail ai/i),
		).not.toBeInTheDocument();
	});

	// Test: Should call onAuthenticate when password login is clicked
	it("calls onAuthenticate when password login is clicked", () => {
		render(
			<MemoryRouter>
				<Login isAuthenticated={false} onAuthenticate={onAuthenticate} />
			</MemoryRouter>,
		);
		fireEvent.click(screen.getByText("Password"));
		fireEvent.click(screen.getByRole("button", { name: /password login/i }));
		expect(onAuthenticate).toHaveBeenCalledWith({ token: "test" });
	});
});
