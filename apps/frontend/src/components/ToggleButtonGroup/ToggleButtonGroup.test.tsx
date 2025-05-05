import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ToggleButtonGroup from "./ToggleButtonGroup";

describe("ToggleButtonGroup", () => {
	// Test that the component renders both buttons and highlights the selected one
	it("renders both buttons and highlights the selected one", () => {
		const setSelectedMethod = vi.fn();
		// Render the component with the setSelectedMethod function
		const { rerender } = render(
			<ToggleButtonGroup
				selectedMethod="magic"
				setSelectedMethod={setSelectedMethod}
			/>,
		);
		const magicBtn = screen.getByRole("button", { name: /magic link/i });
		const passwordBtn = screen.getByRole("button", { name: /password/i });
		expect(magicBtn).toBeInTheDocument();
		expect(passwordBtn).toBeInTheDocument();
		expect(magicBtn.className).toMatch(/toggleActive/);
		expect(passwordBtn.className).not.toMatch(/toggleActive/);

		rerender(
			<ToggleButtonGroup
				selectedMethod="password"
				setSelectedMethod={setSelectedMethod}
			/>,
		);
		expect(passwordBtn.className).toMatch(/toggleActive/);
		expect(magicBtn.className).not.toMatch(/toggleActive/);
	});

	// Test that the component calls setSelectedMethod with the correct value on click
	it("calls setSelectedMethod with correct value on click", () => {
		const setSelectedMethod = vi.fn();
		// Render the component with the setSelectedMethod function
		render(
			<ToggleButtonGroup
				selectedMethod="magic"
				setSelectedMethod={setSelectedMethod}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /password/i }));
		expect(setSelectedMethod).toHaveBeenCalledWith("password");
		fireEvent.click(screen.getByRole("button", { name: /magic link/i }));
		expect(setSelectedMethod).toHaveBeenCalledWith("magic");
	});
});
