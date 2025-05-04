import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePasswordLogin } from "./usePasswordLogin";

vi.mock("react-router-dom", () => ({
	useNavigate: () => vi.fn(),
}));

const mockExecute = vi.fn();
vi.mock("../../hooks/useFetch", () => ({
	useFetch: () => ({
		error: null,
		loading: false,
		execute: mockExecute,
	}),
}));

describe("usePasswordLogin", () => {
	const onAuthenticate = vi.fn();
	const authType = "passwordLogin";

	beforeEach(() => {
		mockExecute.mockReset();
		onAuthenticate.mockReset();
	});

	it("should initialize state correctly", () => {
		const { result } = renderHook(() =>
			usePasswordLogin({ onAuthenticate, authType }),
		);
		expect(result.current.email).toBe("");
		expect(result.current.password).toBe("");
		expect(result.current.error).toBeNull();
		expect(result.current.isSubmitting).toBe(false);
		// functions
		expect(typeof result.current.setEmail).toBe("function");
		expect(typeof result.current.setPassword).toBe("function");
		expect(typeof result.current.handlePasswordLogin).toBe("function");
	});

	it("should update email and password state", () => {
		const { result } = renderHook(() =>
			usePasswordLogin({ onAuthenticate, authType }),
		);
		act(() => {
			result.current.setEmail("user@example.com");
			result.current.setPassword("secret");
		});
		expect(result.current.email).toBe("user@example.com");
		expect(result.current.password).toBe("secret");
	});

	it("should call execute and onAuthenticate on successful login", async () => {
		const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
		mockExecute.mockResolvedValue({ token: "abc" });
		const { result } = renderHook(() =>
			usePasswordLogin({ onAuthenticate, authType }),
		);
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
		expect(onAuthenticate).toHaveBeenCalledWith({ token: "abc" });
	});

	it("should not call onAuthenticate if login fails", async () => {
		const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
		mockExecute.mockResolvedValue(null);
		const { result } = renderHook(() =>
			usePasswordLogin({ onAuthenticate, authType }),
		);
		act(() => {
			result.current.setEmail("user@example.com");
			result.current.setPassword("wrong");
		});
		await act(async () => {
			await result.current.handlePasswordLogin(fakeEvent);
		});
		expect(onAuthenticate).not.toHaveBeenCalled();
	});
});
