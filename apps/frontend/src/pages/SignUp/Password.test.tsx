import { render, screen, fireEvent } from "@testing-library/react";
import Password from "./Password";
import { describe, expect, it, vi, type Mock } from "vitest";
import * as usePasswordModule from "./usePassword";

vi.spyOn(usePasswordModule, "usePassword");

const mockUsePassword = (overrides = {}) => {
	const defaultState = {
		email: "",
		setEmail: vi.fn(),
		password: "",
		setPassword: vi.fn(),
		confirmPassword: "",
		setConfirmPassword: vi.fn(),
		error: "",
		loading: false,
		handlePasswordSignUp: vi.fn((e) => e.preventDefault()),
	};
	const merged = { ...defaultState, ...overrides };
	(usePasswordModule.usePassword as Mock).mockReturnValue(merged);
	return merged;
};

describe("<Password />", () => {
	it("renders all input fields and button", () => {
		mockUsePassword();
		render(<Password onAuthenticate={vi.fn()} />);
		expect(
			screen.getByPlaceholderText(/enter your email/i)
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText(/enter your password/i)
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText(/confirm your password/i)
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /sign up/i })
		).toBeInTheDocument();
	});

	it("calls setEmail, setPassword, setConfirmPassword on input change", () => {
		const setEmail = vi.fn();
		const setPassword = vi.fn();
		const setConfirmPassword = vi.fn();
		mockUsePassword({ setEmail, setPassword, setConfirmPassword });
		render(<Password onAuthenticate={vi.fn()} />);
		fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
			target: { value: "pw" },
		});
		fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), {
			target: { value: "pw" },
		});
		expect(setEmail).toHaveBeenCalledWith("test@example.com");
		expect(setPassword).toHaveBeenCalledWith("pw");
		expect(setConfirmPassword).toHaveBeenCalledWith("pw");
	});

	it("shows error message if error is present", () => {
		mockUsePassword({ error: "Passwords do not match" });
		render(<Password onAuthenticate={vi.fn()} />);
		expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
	});

	it("disables button if loading or fields are empty or error exists", () => {
		mockUsePassword({
			loading: true,
			email: "a",
			password: "b",
			confirmPassword: "c",
		});
		render(<Password onAuthenticate={vi.fn()} />);
		expect(
			screen.getByRole("button", { name: /signing up.../i })
		).toBeDisabled();

		mockUsePassword({
			loading: false,
			email: "",
			password: "b",
			confirmPassword: "c",
		});
		const { unmount } = render(<Password onAuthenticate={vi.fn()} />);
		expect(screen.getByRole("button", { name: /sign up/i })).toBeDisabled();
		unmount();

		mockUsePassword({
			loading: false,
			email: "a",
			password: "b",
			confirmPassword: "c",
			error: "err",
		});
		const { unmount: unmount2 } = render(<Password onAuthenticate={vi.fn()} />);
		expect(screen.getByRole("button", { name: /sign up/i })).toBeDisabled();
		unmount2();
	});

	it("calls handlePasswordSignUp on form submit", () => {
		const handlePasswordSignUp = vi.fn((e) => e.preventDefault());
		mockUsePassword({
			handlePasswordSignUp,
			email: "a",
			password: "b",
			confirmPassword: "c",
		});
		render(<Password onAuthenticate={vi.fn()} />);
		const form = document.querySelector("form");
		fireEvent.submit(form as Element);
		expect(handlePasswordSignUp).toHaveBeenCalled();
	});
});
