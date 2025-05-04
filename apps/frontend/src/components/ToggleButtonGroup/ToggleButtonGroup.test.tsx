import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ToggleButtonGroup from "./ToggleButtonGroup";

describe("ToggleButtonGroup", () => {
	it("renders both buttons and highlights the selected one", () => {
		const setSelectedMethod = vi.fn();
		const { rerender } = render(
			<ToggleButtonGroup
				selectedMethod="magic"
				setSelectedMethod={setSelectedMethod}
			/>
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
			/>
		);
		expect(passwordBtn.className).toMatch(/toggleActive/);
		expect(magicBtn.className).not.toMatch(/toggleActive/);
	});

	it("calls setSelectedMethod with correct value on click", () => {
		const setSelectedMethod = vi.fn();
		render(
			<ToggleButtonGroup
				selectedMethod="magic"
				setSelectedMethod={setSelectedMethod}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /password/i }));
		expect(setSelectedMethod).toHaveBeenCalledWith("password");
		fireEvent.click(screen.getByRole("button", { name: /magic link/i }));
		expect(setSelectedMethod).toHaveBeenCalledWith("magic");
	});
});
