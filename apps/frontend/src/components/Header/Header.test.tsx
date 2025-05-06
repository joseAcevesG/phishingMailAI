import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import Header from "./Header";
import { useHeaderAuth } from "./useHeaderAuth";

// Mock the custom hook to control authentication state in tests
vi.mock("./useHeaderAuth", () => ({
	useHeaderAuth: vi.fn(),
}));

// Cast the mocked hook for type safety and easier usage
const mockedUseHeaderAuth = useHeaderAuth as unknown as Mock;

// Helper to render Header within router context
const renderHeader = () =>
	render(
		<BrowserRouter>
			<Header />
		</BrowserRouter>,
	);

// Group Header tests
describe("Header", () => {
	// Reset mocks before each test to ensure isolation
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test: Should render navigation links for authenticated user
	it("renders navigation links for authenticated user", () => {
		// Simulate authenticated user
		mockedUseHeaderAuth.mockReturnValue({
			userEmail: "user@example.com",
			handleLogout: vi.fn(),
		});

		renderHeader();

		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("History")).toBeInTheDocument();
		expect(screen.getByText("Settings")).toBeInTheDocument();
		expect(screen.getByText(/Logged in as/)).toHaveTextContent(
			"Logged in as user@example.com",
		);
		expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
	});

	// Test: Should render navigation links for unauthenticated user
	it("renders navigation links for unauthenticated user", () => {
		// Simulate unauthenticated user
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
			screen.queryByRole("button", { name: /logout/i }),
		).not.toBeInTheDocument();
	});

	// Test: Should call handleLogout when logout button is clicked
	it("calls handleLogout when logout button is clicked", async () => {
		// Simulate authenticated user with a mock logout handler
		const handleLogout = vi.fn();
		mockedUseHeaderAuth.mockReturnValue({
			userEmail: "user@example.com",
			handleLogout,
		});

		renderHeader();
		const logoutButton = screen.getByRole("button", { name: /logout/i });

		// Simulate user clicking the logout button
		await fireEvent.click(logoutButton);
		expect(handleLogout).toHaveBeenCalledTimes(1);
	});
});
