import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import Header from "./Header";
import { useHeaderAuth } from "./useHeaderAuth";

// Mock the custom hook
vi.mock("./useHeaderAuth", () => ({
	useHeaderAuth: vi.fn(),
}));

const mockedUseHeaderAuth = useHeaderAuth as unknown as Mock;

const renderHeader = () =>
	render(
		<BrowserRouter>
			<Header />
		</BrowserRouter>
	);

describe("Header", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders navigation links for authenticated user", () => {
		mockedUseHeaderAuth.mockReturnValue({
			userEmail: "user@example.com",
			handleLogout: vi.fn(),
		});

		renderHeader();

		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("History")).toBeInTheDocument();
		expect(screen.getByText("Settings")).toBeInTheDocument();
		expect(screen.getByText(/Logged in as/)).toHaveTextContent(
			"Logged in as user@example.com"
		);
		expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
	});

	it("renders navigation links for unauthenticated user", () => {
		mockedUseHeaderAuth.mockReturnValue({
			userEmail: null,
			handleLogout: vi.fn(),
		});

		renderHeader();

		expect(screen.getByText("Landing Page")).toBeInTheDocument();
		expect(screen.getByText("Login")).toBeInTheDocument();
		expect(screen.getByText("Sign Up")).toBeInTheDocument();
		expect(screen.queryByText(/Logged in as/)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /logout/i })
		).not.toBeInTheDocument();
	});

	it("calls handleLogout when logout button is clicked", async () => {
		const handleLogout = vi.fn();
		mockedUseHeaderAuth.mockReturnValue({
			userEmail: "user@example.com",
			handleLogout,
		});

		renderHeader();
		const logoutButton = screen.getByRole("button", { name: /logout/i });

		await fireEvent.click(logoutButton);
		expect(handleLogout).toHaveBeenCalledTimes(1);
	});
});
