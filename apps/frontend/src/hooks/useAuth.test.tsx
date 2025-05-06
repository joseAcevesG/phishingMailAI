import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthContext } from "../context/AuthContext";
import type { AuthContextType, APIAuth } from "../types";
import { useAuth } from "./useAuth";

// Mock implementation for validateStatus function to avoid actual API calls
const mockValidateStatus = (_data: APIAuth) => {};
// Mock context value to simulate an authenticated user for testing purposes
const mockAuthContextValue: AuthContextType = {
	isAuthenticated: true,
	userEmail: "test@example.com",
	loading: false,
	validateStatus: mockValidateStatus,
};

// Test suite for the useAuth custom hook to ensure correct functionality
describe("useAuth", () => {
	// Test: Verify the hook returns the context value when used within an AuthProvider
	it("returns the context value when used within AuthProvider", () => {
		// Create a wrapper component to provide the AuthContext for the test
		const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
			<AuthContext.Provider value={mockAuthContextValue}>
				{children}
			</AuthContext.Provider>
		);

		// Render the useAuth hook within the AuthContext wrapper
		const { result } = renderHook(() => useAuth(), { wrapper });
		// Expect the hook to return the provided context value
		expect(result.current).toBe(mockAuthContextValue);
	});

	// Test: Verify the hook throws an error if used outside of an AuthProvider
	it("throws if used outside of AuthProvider", () => {
		// Suppress error output to keep test logs clean
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		// Expect the hook to throw the correct error message when used without AuthProvider
		expect(() => renderHook(() => useAuth())).toThrowError(
			"useAuth must be used within an AuthProvider"
		);
		// Restore the original console.error behavior
		errorSpy.mockRestore();
	});
});
