import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Login } from "./Login";

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
			<button type="button" onClick={() => setSelectedMethod("magic")}>
				Magic
			</button>
			<button type="button" onClick={() => setSelectedMethod("password")}>
				Password
			</button>
			<span data-testid="selected-method">{selectedMethod}</span>
		</div>
	),
}));
vi.mock("../../components/magicLink/MagicLink", () => ({
	__esModule: true,
	default: ({ buttonText }: { buttonText: string }) => (
		<button type="button">{buttonText}</button>
	),
}));
vi.mock("./Password", () => ({
	__esModule: true,
	default: ({
		onAuthenticate,
	}: {
		onAuthenticate: (data: { token: string }) => void;
	}) => (
		<button type="button" onClick={() => onAuthenticate({ token: "test" })}>
			Password Login
		</button>
	),
}));

describe("Login", () => {
	const onAuthenticate = vi.fn();

	it("renders magic link login by default and switches to password", () => {
		render(
			<MemoryRouter>
				<Login isAuthenticated={false} onAuthenticate={onAuthenticate} />
			</MemoryRouter>
		);
		expect(
			screen.getByText(/welcome to phishing mail ai/i)
		).toBeInTheDocument();
		expect(screen.getByText(/please log in to continue/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /login with magic link/i })
		).toBeInTheDocument();
		// Switch to password
		fireEvent.click(screen.getByText("Password"));
		expect(
			screen.getByRole("button", { name: /password login/i })
		).toBeInTheDocument();
		// Switch back to magic
		fireEvent.click(screen.getByText("Magic"));
		expect(
			screen.getByRole("button", { name: /login with magic link/i })
		).toBeInTheDocument();
	});

	it("shows forgot password link only for password method", () => {
		render(
			<MemoryRouter>
				<Login isAuthenticated={false} onAuthenticate={onAuthenticate} />
			</MemoryRouter>
		);
		// Should not show forgot password link initially
		expect(screen.queryByText(/forgot your password/i)).not.toBeInTheDocument();
		// Switch to password
		fireEvent.click(screen.getByText("Password"));
		expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
	});

	it("shows signup link always", () => {
		render(
			<MemoryRouter>
				<Login isAuthenticated={false} onAuthenticate={onAuthenticate} />
			</MemoryRouter>
		);
		expect(screen.getByText(/don't have an account/i)).toHaveAttribute(
			"href",
			"/signup"
		);
	});

	it("redirects to / if authenticated", () => {
		render(
			<MemoryRouter>
				<Login isAuthenticated={true} onAuthenticate={onAuthenticate} />
			</MemoryRouter>
		);
		expect(
			screen.queryByText(/welcome to phishing mail ai/i)
		).not.toBeInTheDocument();
	});

	it("calls onAuthenticate when password login is clicked", () => {
		render(
			<MemoryRouter>
				<Login isAuthenticated={false} onAuthenticate={onAuthenticate} />
			</MemoryRouter>
		);
		fireEvent.click(screen.getByText("Password"));
		fireEvent.click(screen.getByRole("button", { name: /password login/i }));
		expect(onAuthenticate).toHaveBeenCalledWith({ token: "test" });
	});
});
