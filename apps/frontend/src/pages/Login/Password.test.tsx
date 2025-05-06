import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { usePasswordLogin } from "./usePasswordLogin";
import Password from "./Password";

// Mock usePasswordLogin to control the hook's state and handlers
vi.mock("./usePasswordLogin", () => ({
	usePasswordLogin: vi.fn(),
}));

const mockSetEmail = vi.fn();
const mockSetPassword = vi.fn();
const mockHandlePasswordLogin = vi.fn((e) => e.preventDefault());

function setupPasswordHook({
	email = "",
	password = "",
	error = "",
	isSubmitting = false,
} = {}) {
	(usePasswordLogin as Mock).mockReturnValue({
		email,
		setEmail: mockSetEmail,
		password,
		setPassword: mockSetPassword,
		error,
		isSubmitting,
		handlePasswordLogin: mockHandlePasswordLogin,
	});
}

describe("Password", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders email and password inputs and submit button", () => {
		setupPasswordHook();
		render(<Password />);
		expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
	});

	it("calls setEmail and setPassword on input change", () => {
		setupPasswordHook();
		render(<Password />);
		fireEvent.change(screen.getByPlaceholderText(/email/i), {
			target: { value: "foo@bar.com" },
		});
		expect(mockSetEmail).toHaveBeenCalledWith("foo@bar.com");
		fireEvent.change(screen.getByPlaceholderText(/password/i), {
			target: { value: "secret" },
		});
		expect(mockSetPassword).toHaveBeenCalledWith("secret");
	});

	it("calls handlePasswordLogin on form submit", () => {
		setupPasswordHook();
		render(<Password />);
		fireEvent.submit(screen.getByTestId("password-form"));
		expect(mockHandlePasswordLogin).toHaveBeenCalled();
	});

	it("shows error message if error is present", () => {
		setupPasswordHook({ error: "Invalid credentials" });
		render(<Password />);
		expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
	});

	it("disables submit button when submitting", () => {
		setupPasswordHook({ isSubmitting: true });
		render(<Password />);
		expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
	});
});
