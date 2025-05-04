import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PasswordReset from "./Reset";
import { usePasswordReset } from "./usePasswordReset";

vi.mock("./usePasswordReset", () => ({
	__esModule: true,
	usePasswordReset: vi.fn(),
}));

describe("PasswordReset", () => {
	beforeEach(() => {
		(usePasswordReset as Mock).mockReset();
	});

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
			screen.getByPlaceholderText(/enter your password/i)
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText(/confirm your password/i)
		).toBeInTheDocument();
		const form = container.querySelector(
			"form[data-testid='reset-password-form']"
		);
		expect(form).not.toBeNull();
		fireEvent.submit(form as HTMLFormElement);
		expect(handleSubmit).toHaveBeenCalled();
	});

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
