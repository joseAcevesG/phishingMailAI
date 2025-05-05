import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Password from "./Password";
import { usePasswordLogin } from "./usePasswordLogin";

// Mock the usePasswordLogin hook to control form state and actions
vi.mock("./usePasswordLogin", () => ({
	__esModule: true,
	usePasswordLogin: vi.fn(),
}));

describe("Password", () => {
	const onAuthenticate = vi.fn();

	// Setup: Clear mocks and reset usePasswordLogin before each test
	beforeEach(() => {
		onAuthenticate.mockClear?.();
		(usePasswordLogin as Mock).mockReset();
	});

	// Test: Should render form fields and call handlePasswordLogin on submit
	it("renders form fields and submits login", () => {
		const handlePasswordLogin = vi.fn((e) => e.preventDefault());
		(usePasswordLogin as Mock).mockReturnValue({
			email: "",
			setEmail: vi.fn(),
			password: "",
			setPassword: vi.fn(),
			error: null,
			isSubmitting: false,
			handlePasswordLogin,
		});
		const { container } = render(<Password onAuthenticate={onAuthenticate} />);
		expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
		const form = container.querySelector("form");
		if (!form) {
			throw new Error("Form not found");
		}
		fireEvent.submit(form);
		expect(handlePasswordLogin).toHaveBeenCalled();
	});

	// Test: Should display error message when error exists
	it("displays error message when error exists", () => {
		(usePasswordLogin as Mock).mockReturnValue({
			email: "user@example.com",
			setEmail: vi.fn(),
			password: "secret",
			setPassword: vi.fn(),
			error: "Invalid credentials",
			isSubmitting: false,
			handlePasswordLogin: vi.fn(),
		});
		render(<Password onAuthenticate={onAuthenticate} />);
		expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
	});

	// Test: Should disable submit button while submitting
	it("disables submit button while submitting", () => {
		(usePasswordLogin as Mock).mockReturnValue({
			email: "user@example.com",
			setEmail: vi.fn(),
			password: "secret",
			setPassword: vi.fn(),
			error: null,
			isSubmitting: true,
			handlePasswordLogin: vi.fn(),
		});
		render(<Password onAuthenticate={onAuthenticate} />);
		const button = screen.getByRole("button", { name: /logging in/i });
		expect(button).toBeDisabled();
	});
});
