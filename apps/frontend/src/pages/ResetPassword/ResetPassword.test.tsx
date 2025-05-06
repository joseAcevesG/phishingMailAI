import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ResetPassword from "./ResetPassword";

// Mock the Reset component to isolate ResetPassword tests from its implementation
vi.mock("./Reset", () => ({
	__esModule: true,
	default: () => (
		<form data-testid="reset-password-form-mock">
			<button type="submit">Mock Reset Button</button>
		</form>
	),
}));

describe("ResetPassword", () => {
	// Test: Should render the reset password container, heading, and mocked Reset form
	it("renders the reset password container, heading, and Reset form", () => {
		render(<ResetPassword />);
		expect(
			screen.getByRole("heading", { name: /reset password/i }),
		).toBeInTheDocument();
		expect(screen.getByTestId("reset-password-form-mock")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /mock reset button/i }),
		).toBeInTheDocument();
	});
});
