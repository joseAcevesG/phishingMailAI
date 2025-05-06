import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ResetLink from "./ResetLink";

// Mock MagicLink component to isolate ResetLink tests from its implementation
vi.mock("../../components/magicLink/MagicLink", () => ({
	__esModule: true,
	default: ({ buttonText }: { buttonText: string }) => (
		<form data-testid="magic-link-form">
			<button type="submit">{buttonText}</button>
		</form>
	),
}));

describe("ResetLink", () => {
	// Test: Should render the reset password form when not authenticated
	it("renders reset password form when not authenticated", () => {
		render(
			<MemoryRouter>
				<ResetLink />
			</MemoryRouter>
		);
		expect(
			screen.getByRole("heading", { name: /reset password/i })
		).toBeInTheDocument();
		expect(
			screen.getByText(/enter your email address to reset your password/i)
		).toBeInTheDocument();
		expect(screen.getByTestId("magic-link-form")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /reset password/i })
		).toBeInTheDocument();
	});
});
