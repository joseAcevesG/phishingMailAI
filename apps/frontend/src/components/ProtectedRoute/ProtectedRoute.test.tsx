import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";

describe("ProtectedRoute", () => {
	// If the user is authenticated, render the children
	it("renders children when authenticated", () => {
		render(
			<MemoryRouter>
				<ProtectedRoute isAuthenticated={true}>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);
		expect(screen.getByText("Protected Content")).toBeInTheDocument();
	});

	// If the user is not authenticated, redirect to /login
	it("redirects to /login when not authenticated", () => {
		render(
			<MemoryRouter initialEntries={["/protected"]}>
				<ProtectedRoute isAuthenticated={false}>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);
		expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
	});
});
