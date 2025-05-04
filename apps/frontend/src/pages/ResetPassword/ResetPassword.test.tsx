import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResetPassword } from "./ResetPassword";

vi.mock("./Reset", () => ({
	__esModule: true,
	default: () => (
		<form data-testid="reset-password-form-mock">
			<button type="submit">Mock Reset Button</button>
		</form>
	),
}));

describe("ResetPassword", () => {
	it("renders the reset password container, heading, and Reset form", () => {
		render(<ResetPassword />);
		// Check for container and box by id or class if needed
		expect(
			screen.getByRole("heading", { name: /reset password/i })
		).toBeInTheDocument();
		expect(screen.getByTestId("reset-password-form-mock")).toBeInTheDocument();
		// Check for the mock button
		expect(
			screen.getByRole("button", { name: /mock reset button/i })
		).toBeInTheDocument();
	});
});
