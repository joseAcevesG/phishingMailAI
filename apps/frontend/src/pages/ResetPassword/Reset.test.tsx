import { fireEvent, render, screen } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import PasswordReset from "./Reset";
import { usePasswordReset } from "./usePasswordReset";

// Mock the usePasswordReset hook to control form state and actions
vi.mock("./usePasswordReset", () => ({
	__esModule: true,
	usePasswordReset: vi.fn(),
}));

describe("PasswordReset", () => {
	// Reset the mock before each test for isolation
	beforeEach(() => {
		(usePasswordReset as Mock).mockReset();
	});

	// Test: Should render form fields and call handleSubmit on submit
	it("renders form fields and submits", () => {
		const handleSubmit = vi.fn((e) => e.preventDefault());
		(usePasswordReset as Mock).mockReturnValue({
			password: "",
			setPassword: vi.fn(),
			confirmPassword: "",
			setConfirmPassword: vi.fn(),
			validationError: null,
			fetchError: null,
			isSubmitting: false,
			handleSubmit,
		});
		const { container } = render(<PasswordReset />);
		expect(
			screen.getByPlaceholderText(/enter your password/i),
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText(/confirm your password/i),
		).toBeInTheDocument();
		const form = container.querySelector(
			"form[data-testid='reset-password-form']",
		);
		expect(form).not.toBeNull();
		fireEvent.submit(form as HTMLFormElement);
		expect(handleSubmit).toHaveBeenCalled();
	});

	// Test: Should show error message when there is a validation or fetch error
	it("shows error message when there is a validation or fetch error", () => {
		(usePasswordReset as Mock).mockReturnValue({
			password: "foo",
			setPassword: vi.fn(),
			confirmPassword: "bar",
			setConfirmPassword: vi.fn(),
			validationError: "Passwords do not match",
			fetchError: null,
			isSubmitting: false,
			handleSubmit: vi.fn(),
		});
		render(<PasswordReset />);
		expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
	});

	// Test: Should disable submit button while submitting or when validation error exists
	it("disables submit button while submitting or when validation error exists", () => {
		(usePasswordReset as Mock).mockReturnValue({
			password: "foo",
			setPassword: vi.fn(),
			confirmPassword: "bar",
			setConfirmPassword: vi.fn(),
			validationError: null,
			fetchError: null,
			isSubmitting: true,
			handleSubmit: vi.fn(),
		});
		render(<PasswordReset />);
		const button = screen.getByRole("button", { name: /resetting/i });
		expect(button).toBeDisabled();

		(usePasswordReset as Mock).mockReturnValue({
			password: "foo",
			setPassword: vi.fn(),
			confirmPassword: "bar",
			setConfirmPassword: vi.fn(),
			validationError: "Invalid",
			fetchError: null,
			isSubmitting: false,
			handleSubmit: vi.fn(),
		});
		render(<PasswordReset />);
		const button2 = screen.getByRole("button", { name: /reset password/i });
		expect(button2).toBeDisabled();
	});
});
