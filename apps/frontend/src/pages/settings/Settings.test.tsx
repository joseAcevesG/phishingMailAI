import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SettingsPage from "./Settings";
import type { Mock } from "vitest";
import { useSettings } from "./useSettings";

// Mock useSettings hook to control the state and actions for the Settings page
vi.mock("./useSettings", () => ({
	__esModule: true,
	useSettings: vi.fn(),
}));

describe("SettingsPage", () => {
	// Reset the useSettings mock before each test for isolation
	beforeEach(() => {
		(useSettings as Mock).mockReset();
	});

	// Test: Should render all sections and allow API key input and logout
	it("renders all sections and allows API key input and logout", () => {
		const setApiKey = vi.fn();
		const handleKeySubmit = vi.fn((e) => e.preventDefault());
		const handleLogoutAll = vi.fn();
		(useSettings as Mock).mockReturnValue({
			apiKey: "",
			setApiKey,
			keyError: null,
			keyLoading: false,
			handleKeySubmit,
			logoutError: null,
			logoutLoading: false,
			handleLogoutAll,
		});
		render(
			<MemoryRouter>
				<SettingsPage />
			</MemoryRouter>
		);
		// Check for presence of all headings and links
		expect(
			screen.getByRole("heading", { name: /password/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: /openai api key/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: /danger zone/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /reset password/i })
		).toBeInTheDocument();

		// Simulate API key input and form submission
		const apiInput = screen.getByPlaceholderText(/sk-/i);
		fireEvent.change(apiInput, { target: { value: "sk-test" } });
		expect(setApiKey).toHaveBeenCalledWith("sk-test");
		const apiForm = apiInput.closest("form");
		expect(apiForm).not.toBeNull();
		if (!apiForm) {
			throw new Error("API form not found");
		}
		fireEvent.submit(apiForm);
		expect(handleKeySubmit).toHaveBeenCalled();

		// Simulate logout button click
		const logoutButton = screen.getByRole("button", {
			name: /log out on all devices/i,
		});
		fireEvent.click(logoutButton);
		expect(handleLogoutAll).toHaveBeenCalled();
	});

	// Test: Should show error messages for API key and logout
	it("shows error messages for API key and logout", () => {
		(useSettings as Mock).mockReturnValue({
			apiKey: "sk-test",
			setApiKey: vi.fn(),
			keyError: "Invalid API Key",
			keyLoading: false,
			handleKeySubmit: vi.fn(),
			logoutError: "Logout failed",
			logoutLoading: false,
			handleLogoutAll: vi.fn(),
		});
		render(
			<MemoryRouter>
				<SettingsPage />
			</MemoryRouter>
		);
		// Check for error messages
		expect(screen.getByText(/invalid api key/i)).toBeInTheDocument();
		expect(screen.getByText(/logout failed/i)).toBeInTheDocument();
	});
});
