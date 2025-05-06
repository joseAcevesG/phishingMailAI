import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth", () => ({ useAuth: vi.fn() }));
const mockedUseAuth = useAuth as unknown as Mock;

describe("ProtectedRoute", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// If the user is authenticated, render the children
	it("renders children when authenticated", () => {
		mockedUseAuth.mockReturnValue({ isAuthenticated: true });
		render(
			<MemoryRouter>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);
		expect(screen.getByText("Protected Content")).toBeInTheDocument();
	});

	// If the user is not authenticated, redirect to /login
	it("redirects to /login when not authenticated", () => {
		mockedUseAuth.mockReturnValue({ isAuthenticated: false });
		render(
			<MemoryRouter initialEntries={["/protected"]}>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);
		expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
	});
});
