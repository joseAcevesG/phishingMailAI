import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Header, type Props } from "./Header";

const renderHeader = (props: Props) =>
	render(
		<BrowserRouter>
			<Header {...props} />
		</BrowserRouter>
	);

describe("Header", () => {
	it("renders navigation links for authenticated user", () => {
		renderHeader({ userEmail: "user@example.com", onLogout: vi.fn() });
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("History")).toBeInTheDocument();
		expect(screen.getByText("Settings")).toBeInTheDocument();
		expect(screen.getByText(/Logged in as/)).toHaveTextContent(
			"Logged in as user@example.com"
		);
		expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
	});

	it("renders navigation links for unauthenticated user", () => {
		renderHeader({ userEmail: null, onLogout: vi.fn() });
		expect(screen.getByText("Landing Page")).toBeInTheDocument();
		expect(screen.getByText("Login")).toBeInTheDocument();
		expect(screen.getByText("Sign Up")).toBeInTheDocument();
		expect(screen.queryByText(/Logged in as/)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /logout/i })
		).not.toBeInTheDocument();
	});

	it("calls onLogout when logout button is clicked", () => {
		const onLogout = vi.fn();
		renderHeader({ userEmail: "user@example.com", onLogout });
		const logoutButton = screen.getByRole("button", { name: /logout/i });
		fireEvent.click(logoutButton);
		expect(onLogout).toHaveBeenCalledTimes(1);
	});
});
