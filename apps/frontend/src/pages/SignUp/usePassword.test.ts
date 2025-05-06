import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { APIAuth } from "../../types";
import { usePassword } from "./usePassword";

// Mocks for navigation, fetch, and password validation
const mocks: {
	mockNavigate: ReturnType<typeof vi.fn>;
	mockExecute: ReturnType<typeof vi.fn>;
	mockValidateAll: ReturnType<typeof vi.fn>;
} = {
	mockNavigate: vi.fn(),
	mockExecute: vi.fn(),
	mockValidateAll: vi.fn(),
};

// Mock react-router-dom's useNavigate
vi.mock("react-router-dom", () => ({
	useNavigate: () => mocks.mockNavigate,
}));
// Mock useAuth to prevent AuthProvider error
vi.mock("../../hooks/useAuth", () => ({
	useAuth: () => ({ validateStatus: vi.fn() }),
}));
// Mock useFetch to control API call behavior
vi.mock("../../hooks/useFetch", () => ({
	useFetch: () => ({
		execute: mocks.mockExecute,
		error: undefined,
		loading: false,
	}),
}));
// Mock validateAll to control password validation logic
vi.mock("../../services/validatePassword", () => ({
	validateAll: (...args: unknown[]) => mocks.mockValidateAll(...args),
}));

describe("usePassword", () => {
	// Reset all mocks before each test for isolation
	beforeEach(() => {
		for (const fn of Object.values(mocks)) {
			fn.mockReset();
		}
	});

	// Test: Should initialize with empty fields and default states
	it("should initialize with empty fields and default states", () => {
		const { result } = renderHook(() => usePassword());
		expect(result.current.email).toBe("");
		expect(result.current.password).toBe("");
		expect(result.current.confirmPassword).toBe("");
		expect(result.current.error).toBeUndefined();
		expect(result.current.loading).toBe(false);
	});

	// Test: Should update email, password, and confirmPassword
	it("should update email, password, and confirmPassword", () => {
		const { result } = renderHook(() => usePassword());
		act(() => result.current.setEmail("test@example.com"));
		act(() => result.current.setPassword("pw1"));
		act(() => result.current.setConfirmPassword("pw1"));
		expect(result.current.email).toBe("test@example.com");
		expect(result.current.password).toBe("pw1");
		expect(result.current.confirmPassword).toBe("pw1");
	});

	// Test: Should validate passwords on change
	it("should validate passwords on change", () => {
		mocks.mockValidateAll.mockReturnValue("Passwords do not match");
		const { result } = renderHook(() => usePassword());
		act(() => result.current.setPassword("a"));
		act(() => result.current.setConfirmPassword("b"));
		expect(mocks.mockValidateAll).toHaveBeenCalledWith("a", "b");
		act(() => {
			result.current.setPassword("pw");
			result.current.setConfirmPassword("pw");
		});
	});

	// Test: Should call execute and handle success on submit
	it("should call execute and handle success on submit", async () => {
		const fakeAuth: APIAuth = { authenticated: true, email: "e" };
		mocks.mockExecute.mockResolvedValue(fakeAuth);
		const { result } = renderHook(() => usePassword());
		act(() => {
			result.current.setEmail("e");
			result.current.setPassword("pw");
			result.current.setConfirmPassword("pw");
		});
		const fakeEvent = {
			preventDefault: () => {},
		} as React.FormEvent<HTMLFormElement>;
		await act(async () => {
			await result.current.handlePasswordSignUp(fakeEvent);
		});
		expect(mocks.mockExecute).toHaveBeenCalledWith({
			body: { email: "e", password: "pw", type: expect.any(String) },
		});
		expect(mocks.mockNavigate).toHaveBeenCalledWith("/");
	});

	// Test: Should set error if signup fails
	it("should set error if signup fails", async () => {
		mocks.mockExecute.mockResolvedValue(undefined);
		const { result } = renderHook(() => usePassword());
		act(() => {
			result.current.setEmail("e");
			result.current.setPassword("pw");
			result.current.setConfirmPassword("pw");
		});
		const fakeEvent = {
			preventDefault: () => {},
		} as React.FormEvent<HTMLFormElement>;
		await act(async () => {
			await result.current.handlePasswordSignUp(fakeEvent);
		});
		expect(result.current.error).toMatch(/signup failed/i);
	});
});
