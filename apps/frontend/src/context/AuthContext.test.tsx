import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, AuthContext } from "./AuthContext";

// Mock useNavigate from react-router-dom
let navigateMock: Mock;
vi.mock("react-router-dom", () => ({
	useNavigate: () => navigateMock,
}));

// Mock useFetch hook
const mockFetch = vi.fn();
vi.mock("../hooks/useFetch", () => ({
	useFetch: () => ({ execute: mockFetch }),
}));

beforeEach(() => {
	mockFetch.mockReset();
	navigateMock = vi.fn();
});

describe("AuthProvider", () => {
	it("provides authenticated state and userEmail after successful status fetch", async () => {
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

		await waitFor(() => {
			expect(screen.getByTestId("is-auth").textContent).toBe("true");
			expect(screen.getByTestId("user-email").textContent).toBe(
				"test@example.com"
			);
			expect(screen.getByTestId("loading").textContent).toBe("false");
		});
	});

	it("provides unauthenticated state and null userEmail when status fetch fails", async () => {
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

		await waitFor(() => {
			expect(screen.getByTestId("is-auth").textContent).toBe("false");
			expect(screen.getByTestId("user-email").textContent).toBe("null");
			expect(screen.getByTestId("loading").textContent).toBe("false");
		});
	});

	it("redirects to /login when not authenticated", async () => {
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
		await waitFor(() => {
			expect(screen.getByTestId("is-auth").textContent).toBe("false");
			expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
		});
	});
});
