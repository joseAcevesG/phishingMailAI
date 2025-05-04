import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Password from "./Password";
import { usePasswordLogin } from "./usePasswordLogin";

// Mock the usePasswordLogin hook to control its behavior in tests
vi.mock("./usePasswordLogin", () => ({
	__esModule: true,
	usePasswordLogin: vi.fn(),
}));

// usePasswordLogin is now imported directly, no require

describe("Password", () => {
	const onAuthenticate = vi.fn();

	beforeEach(() => {
		onAuthenticate.mockClear?.();
		(usePasswordLogin as Mock).mockReset();
	});

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
