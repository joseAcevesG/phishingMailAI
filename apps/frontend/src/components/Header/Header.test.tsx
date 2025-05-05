import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Header, type Props } from "./Header";

const renderHeader = (props: Props) =>
	render(
		<BrowserRouter>
			<Header {...props} />
		</BrowserRouter>,
	);

describe("Header", () => {
	it("renders navigation links for authenticated user", () => {
		// Render the Header component with a user email and an onLogout function.
		renderHeader({ userEmail: "user@example.com", onLogout: vi.fn() });

		// Expect the navigation links to be present in the document.
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("History")).toBeInTheDocument();
		expect(screen.getByText("Settings")).toBeInTheDocument();
		expect(screen.getByText(/Logged in as/)).toHaveTextContent(
			"Logged in as user@example.com",
		);
		expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
	});

	it("renders navigation links for unauthenticated user", () => {
		// Render the Header component with no user email and an onLogout function.
		renderHeader({ userEmail: null, onLogout: vi.fn() });

		// Expect the navigation links to be present in the document.
		expect(screen.getByText("Landing Page")).toBeInTheDocument();
		expect(screen.getByText("Login")).toBeInTheDocument();
		expect(screen.getByText("Sign Up")).toBeInTheDocument();
		expect(screen.queryByText(/Logged in as/)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /logout/i }),
		).not.toBeInTheDocument();
	});

	it("calls onLogout when logout button is clicked", () => {
		const onLogout = vi.fn();

		// Render the Header component with a user email and the mock onLogout function.
		renderHeader({ userEmail: "user@example.com", onLogout });
		const logoutButton = screen.getByRole("button", { name: /logout/i });

		// Simulate a click event on the logout button.
		fireEvent.click(logoutButton);
		expect(onLogout).toHaveBeenCalledTimes(1);
	});
});
