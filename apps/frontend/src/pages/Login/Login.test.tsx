import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Login } from "./Login";

// Mock the child components to isolate Login logic
vi.mock("../../components/ToggleButtonGroup/ToggleButtonGroup", () => ({
	default: ({
		selectedMethod,
		setSelectedMethod,
	}: {
		selectedMethod: "magic" | "password";
		setSelectedMethod: (method: "magic" | "password") => void;
	}) => (
		<div>
			<button type="button" onClick={() => setSelectedMethod("magic")}>
				Magic
			</button>
			<button type="button" onClick={() => setSelectedMethod("password")}>
				Password
			</button>
			<span>Current: {selectedMethod}</span>
		</div>
	),
}));
vi.mock("../../components/magicLink/MagicLink", () => ({
	default: () => <div>MagicLinkMock</div>,
}));
vi.mock("./Password", () => ({
	default: () => <div>PasswordMock</div>,
}));

describe("Login", () => {
	it("renders heading, prompt, toggle, and signup link", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>
		);
		expect(
			screen.getByRole("heading", { name: /welcome to phishing mail ai/i })
		).toBeInTheDocument();
		expect(screen.getByText(/please log in to continue/i)).toBeInTheDocument();
		expect(screen.getByText("MagicLinkMock")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /don't have an account/i })
		).toBeInTheDocument();
		// Password reset link should not be visible initially
		expect(screen.queryByText(/forgot your password/i)).not.toBeInTheDocument();
	});

	it("shows Password component and reset link when password method is selected", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>
		);
		// Switch to password method
		fireEvent.click(screen.getByText("Password"));
		expect(screen.getByText("PasswordMock")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /forgot your password/i })
		).toBeInTheDocument();
		// MagicLink should not be visible
		expect(screen.queryByText("MagicLinkMock")).not.toBeInTheDocument();
	});

	it("shows MagicLink component and hides reset link when magic method is selected", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>
		);
		// Switch to password then back to magic
		fireEvent.click(screen.getByText("Password"));
		fireEvent.click(screen.getByText("Magic"));
		expect(screen.getByText("MagicLinkMock")).toBeInTheDocument();
		expect(screen.queryByText(/forgot your password/i)).not.toBeInTheDocument();
		expect(screen.queryByText("PasswordMock")).not.toBeInTheDocument();
	});
});
