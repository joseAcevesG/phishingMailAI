// Import vitest and React Testing Library utilities
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, AuthContext } from "./AuthContext";

// Mock useNavigate from react-router-dom to capture navigation attempts
let navigateMock: Mock;
vi.mock("react-router-dom", () => ({
	useNavigate: () => navigateMock,
}));

// Mock useFetch hook to control API responses for authentication status
const mockFetch = vi.fn();
vi.mock("../hooks/useFetch", () => ({
	useFetch: () => ({ execute: mockFetch }),
}));

// Reset mocks before each test to ensure isolation
beforeEach(() => {
	mockFetch.mockReset();
	navigateMock = vi.fn();
});

describe("AuthProvider", () => {
	// Test that AuthProvider sets authenticated state and userEmail after a successful status fetch
	it("provides authenticated state and userEmail after successful status fetch", async () => {
		// Simulate successful authentication response from backend
		mockFetch.mockResolvedValue({
			authenticated: true,
			email: "test@example.com",
		});
		render(
			<AuthProvider>
				<AuthContext.Consumer>
					{(value) =>
						value ? (
							<div>
								<span data-testid="is-auth">
									{String(value.isAuthenticated)}
								</span>
								<span data-testid="user-email">{value.userEmail}</span>
								<span data-testid="loading">{String(value.loading)}</span>
							</div>
						) : null
					}
				</AuthContext.Consumer>
			</AuthProvider>
		);

		// Wait for async state update and verify context values
		await waitFor(() => {
			expect(screen.getByTestId("is-auth").textContent).toBe("true");
			expect(screen.getByTestId("user-email").textContent).toBe(
				"test@example.com"
			);
			expect(screen.getByTestId("loading").textContent).toBe("false");
		});
	});

	// Test that AuthProvider sets unauthenticated state and null email when status fetch fails
	it("provides unauthenticated state and null userEmail when status fetch fails", async () => {
		// Simulate failed authentication response (e.g., network error or unauthenticated)
		mockFetch.mockResolvedValue(undefined);
		render(
			<AuthProvider>
				<AuthContext.Consumer>
					{(value) =>
						value ? (
							<div>
								<span data-testid="is-auth">
									{String(value.isAuthenticated)}
								</span>
								<span data-testid="user-email">{String(value.userEmail)}</span>
								<span data-testid="loading">{String(value.loading)}</span>
							</div>
						) : null
					}
				</AuthContext.Consumer>
			</AuthProvider>
		);

		// Wait for async state update and verify context values
		await waitFor(() => {
			expect(screen.getByTestId("is-auth").textContent).toBe("false");
			expect(screen.getByTestId("user-email").textContent).toBe("null");
			expect(screen.getByTestId("loading").textContent).toBe("false");
		});
	});

	// Test that unauthenticated users are redirected to /login
	it("redirects to /login when not authenticated", async () => {
		// Simulate backend response indicating user is not authenticated
		mockFetch.mockResolvedValue({ authenticated: false });
		render(
			<AuthProvider>
				<AuthContext.Consumer>
					{(value) =>
						value ? (
							<span data-testid="is-auth">{String(value.isAuthenticated)}</span>
						) : null
					}
				</AuthContext.Consumer>
			</AuthProvider>
		);
		// Wait for async state update and verify redirect was triggered
		await waitFor(() => {
			expect(screen.getByTestId("is-auth").textContent).toBe("false");
			expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
		});
	});
});
