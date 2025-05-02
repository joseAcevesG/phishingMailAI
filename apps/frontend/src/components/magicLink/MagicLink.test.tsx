import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MagicLink from "./MagicLink";

// Mock the useMagicLink hook
vi.mock("./useMagicLink", () => ({
	useMagicLink: vi.fn(),
}));

import { useMagicLink, type UseMagicLinkReturn } from "./useMagicLink";

describe("MagicLink", () => {
	const mockSetEmail = vi.fn();
	const mockSetError = vi.fn();
	const mockHandleMagicLinkRequest = vi.fn();

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
		vi.clearAllMocks();
		(useMagicLink as MockedFunction<() => UseMagicLinkReturn>).mockReturnValue({
			...baseHookValues,
		});
	});

	it("renders input and button", () => {
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /send link/i })
		).toBeInTheDocument();
	});

	it("calls setEmail and setError on input change", () => {
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		const input = screen.getByPlaceholderText("Enter your email");
		fireEvent.change(input, { target: { value: "test@example.com" } });
		expect(mockSetEmail).toHaveBeenCalledWith("test@example.com");
		expect(mockSetError).toHaveBeenCalledWith(null);
	});

	it("calls handleMagicLinkRequest on form submit", () => {
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		const form = screen.getByTestId("magic-link-form");
		fireEvent.submit(form);
		expect(mockHandleMagicLinkRequest).toHaveBeenCalled();
	});

	it("disables button if isButtonDisabled", () => {
		(useMagicLink as MockedFunction<() => UseMagicLinkReturn>).mockReturnValue({
			...baseHookValues,
			isButtonDisabled: true,
		});
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("disables button if email is empty", () => {
		(useMagicLink as MockedFunction<() => UseMagicLinkReturn>).mockReturnValue({
			...baseHookValues,
			email: "",
			isButtonDisabled: false,
		});
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("shows error message when error is present", () => {
		(useMagicLink as MockedFunction<() => UseMagicLinkReturn>).mockReturnValue({
			...baseHookValues,
			error: "Invalid email",
		});
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		expect(screen.getByText("Invalid email")).toBeInTheDocument();
	});

	it("shows countdown text when isButtonDisabled is true", () => {
		(useMagicLink as MockedFunction<() => UseMagicLinkReturn>).mockReturnValue({
			...baseHookValues,
			isButtonDisabled: true,
			countdown: 42,
		});
		render(<MagicLink buttonText="Send Link" url="/api/magic-link" />);
		expect(
			screen.getByText(/You can resend a magic link in: 42 seconds/)
		).toBeInTheDocument();
	});
});
