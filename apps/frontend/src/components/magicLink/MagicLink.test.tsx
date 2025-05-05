import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockedFunction } from "vitest";
import MagicLink from "./MagicLink";

// Mock the useMagicLink hook
vi.mock("./useMagicLink", () => ({
	useMagicLink: vi.fn(),
}));

import { type UseMagicLinkReturn, useMagicLink } from "./useMagicLink";

describe("MagicLink", () => {
	// Mock functions for the useMagicLink return values
	const mockSetEmail = vi.fn();
	const mockSetError = vi.fn();
	const mockHandleMagicLinkRequest = vi.fn();

	// Base return values for the useMagicLink hook
	const baseHookValues = {
		email: "",
		setEmail: mockSetEmail,
		isButtonDisabled: false,
		countdown: 0,
		error: null,
		setError: mockSetError,
		handleMagicLinkRequest: mockHandleMagicLinkRequest,
	};

	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();
		// Mock the useMagicLink hook with the base return values
		(useMagicLink as MockedFunction<() => UseMagicLinkReturn>).mockReturnValue({
			...baseHookValues,
		});
	});

	it("renders input and button", () => {
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		// Check if the input and button are rendered
		expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /send link/i }),
		).toBeInTheDocument();
	});

	it("calls setEmail and setError on input change", () => {
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		const input = screen.getByPlaceholderText("Enter your email");
		fireEvent.change(input, { target: { value: "test@example.com" } });
		// Check if setEmail and setError are called
		expect(mockSetEmail).toHaveBeenCalledWith("test@example.com");
		expect(mockSetError).toHaveBeenCalledWith(null);
	});

	it("calls handleMagicLinkRequest on form submit", () => {
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		const form = screen.getByTestId("magic-link-form");
		fireEvent.submit(form);
		// Check if handleMagicLinkRequest is called
		expect(mockHandleMagicLinkRequest).toHaveBeenCalled();
	});

	it("disables button if isButtonDisabled", () => {
		// Mock the useMagicLink hook with isButtonDisabled set to true
		(useMagicLink as MockedFunction<() => UseMagicLinkReturn>).mockReturnValue({
			...baseHookValues,
			isButtonDisabled: true,
		});
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		// Check if the button is disabled
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("disables button if email is empty", () => {
		// Mock the useMagicLink hook with email set to an empty string
		(useMagicLink as MockedFunction<() => UseMagicLinkReturn>).mockReturnValue({
			...baseHookValues,
			email: "",
			isButtonDisabled: false,
		});
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		// Check if the button is disabled
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("shows error message when error is present", () => {
		// Mock the useMagicLink hook with error set to "Invalid email"
		(useMagicLink as MockedFunction<() => UseMagicLinkReturn>).mockReturnValue({
			...baseHookValues,
			error: "Invalid email",
		});
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		// Check if the error message is shown
		expect(screen.getByText("Invalid email")).toBeInTheDocument();
	});

	it("shows countdown text when isButtonDisabled is true", () => {
		// Mock the useMagicLink hook with isButtonDisabled set to true and countdown set to 42
		(useMagicLink as MockedFunction<() => UseMagicLinkReturn>).mockReturnValue({
			...baseHookValues,
			isButtonDisabled: true,
			countdown: 42,
		});
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		// Check if the countdown text is shown
		expect(
			screen.getByText(/You can resend a magic link in: 42 seconds/),
		).toBeInTheDocument();
	});
});
