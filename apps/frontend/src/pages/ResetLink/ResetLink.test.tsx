import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ResetLink } from "./ResetLink";

vi.mock("../../components/magicLink/MagicLink", () => ({
	__esModule: true,
	default: ({ buttonText }: { buttonText: string }) => (
		<form data-testid="magic-link-form">
			<button type="submit">{buttonText}</button>
		</form>
	),
}));

describe("ResetLink", () => {
	it("renders reset password form when not authenticated", () => {
		render(
			<MemoryRouter>
				<ResetLink isAuthenticated={false} />
			</MemoryRouter>
		);
		expect(
			screen.getByRole("heading", { name: /reset password/i })
		).toBeInTheDocument();
		expect(
			screen.getByText(/enter your email address to reset your password/i)
		).toBeInTheDocument();
		// MagicLink form and button
		expect(screen.getByTestId("magic-link-form")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /reset password/i })
		).toBeInTheDocument();
	});

	it("redirects to / if authenticated", () => {
		render(
			<MemoryRouter>
				<ResetLink isAuthenticated={true} />
			</MemoryRouter>
		);
		expect(screen.queryByText(/reset password/i)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /reset password/i })
		).not.toBeInTheDocument();
	});
});
