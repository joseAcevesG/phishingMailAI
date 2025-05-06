import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthContext } from "../context/AuthContext";
import type { AuthContextType, APIAuth } from "../types";
import { useAuth } from "./useAuth";

const mockValidateStatus = (_data: APIAuth) => {};
const mockAuthContextValue: AuthContextType = {
	isAuthenticated: true,
	userEmail: "test@example.com",
	loading: false,
	validateStatus: mockValidateStatus,
};

describe("useAuth", () => {
	it("returns the context value when used within AuthProvider", () => {
		const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
			<AuthContext.Provider value={mockAuthContextValue}>
				{children}
			</AuthContext.Provider>
		);

		const { result } = renderHook(() => useAuth(), { wrapper });
		expect(result.current).toBe(mockAuthContextValue);
	});

	it("throws if used outside of AuthProvider", () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => renderHook(() => useAuth())).toThrowError(
			"useAuth must be used within an AuthProvider"
		);
		errorSpy.mockRestore();
	});
});
