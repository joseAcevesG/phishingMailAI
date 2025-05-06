import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePasswordLogin } from "./usePasswordLogin";

// Mock dependencies
const mockExecute = vi.fn();
const mockValidateStatus = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../hooks/useFetch", () => ({
	useFetch: () => ({
		error: null,
		loading: false,
		execute: mockExecute,
	}),
}));

vi.mock("../../hooks/useAuth", () => ({
	useAuth: () => ({
		validateStatus: mockValidateStatus,
	}),
}));

vi.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
}));

describe("usePasswordLogin", () => {
	const authType = "passwordLogin";

	// Reset mocks before each test to ensure isolation
	beforeEach(() => {
		mockExecute.mockReset();
		mockValidateStatus.mockReset();
		mockNavigate.mockReset();
	});

	// Test: Should initialize state variables correctly
	it("should initialize state correctly", () => {
		const { result } = renderHook(() => usePasswordLogin({ authType }));
		expect(result.current.email).toBe("");
		expect(result.current.password).toBe("");
		expect(result.current.error).toBeNull();
		expect(result.current.isSubmitting).toBe(false);
		expect(typeof result.current.setEmail).toBe("function");
		expect(typeof result.current.setPassword).toBe("function");
		expect(typeof result.current.handlePasswordLogin).toBe("function");
	});

	// Test: Should update email and password state when setters are called
	it("should update email and password state", () => {
		const { result } = renderHook(() => usePasswordLogin({ authType }));
		act(() => {
			result.current.setEmail("user@example.com");
			result.current.setPassword("secret");
		});
		expect(result.current.email).toBe("user@example.com");
		expect(result.current.password).toBe("secret");
	});

	// Test: Should call execute on successful login
	it("should call execute on successful login", async () => {
		const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
		mockExecute.mockResolvedValue({ token: "abc" });
		const { result } = renderHook(() => usePasswordLogin({ authType }));
		act(() => {
			result.current.setEmail("user@example.com");
			result.current.setPassword("secret");
		});
		await act(async () => {
			await result.current.handlePasswordLogin(fakeEvent);
		});
		expect(mockExecute).toHaveBeenCalledWith({
			body: { email: "user@example.com", password: "secret", type: authType },
		});
	});

	// Test: Should call validateStatus and navigate on success
	it("should call validateStatus and navigate on success", async () => {
		const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
		mockExecute.mockResolvedValue({ token: "abc" });
		const { result } = renderHook(() => usePasswordLogin({ authType }));
		act(() => {
			result.current.setEmail("user@example.com");
			result.current.setPassword("secret");
		});
		await act(async () => {
			await result.current.handlePasswordLogin(fakeEvent);
		});
		expect(mockExecute).toHaveBeenCalledWith({
			body: { email: "user@example.com", password: "secret", type: authType },
		});
		expect(mockValidateStatus).toHaveBeenCalledWith({ token: "abc" });
		expect(mockNavigate).toHaveBeenCalledWith("/");
	});

	// Test: Should not call validateStatus or navigate if login fails
	it("should not call validateStatus or navigate if login fails", async () => {
		const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
		mockExecute.mockResolvedValue(null);
		const { result } = renderHook(() => usePasswordLogin({ authType }));
		act(() => {
			result.current.setEmail("user@example.com");
			result.current.setPassword("wrong");
		});
		await act(async () => {
			await result.current.handlePasswordLogin(fakeEvent);
		});
		expect(mockValidateStatus).not.toHaveBeenCalled();
		expect(mockNavigate).not.toHaveBeenCalled();
	});
});
