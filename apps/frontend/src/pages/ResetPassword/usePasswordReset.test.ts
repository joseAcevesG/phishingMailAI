import { act, renderHook } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "../../hooks/useFetch";
import { validateAll } from "../../services/validatePassword";
import { usePasswordReset } from "./usePasswordReset";

vi.mock("react-router-dom", () => ({
	useNavigate: () => vi.fn(),
	useSearchParams: () => [new URLSearchParams("token=abc")],
}));

vi.mock("../../hooks/useFetch", () => ({
	useFetch: vi.fn(),
}));

vi.mock("../../services/validatePassword", () => ({
	validateAll: vi.fn(() => null),
}));

describe("usePasswordReset", () => {
	beforeEach(() => {
		(useFetch as Mock).mockReset();
		(validateAll as Mock).mockReset();
	});

	it("initializes with correct default state", () => {
		(useFetch as Mock).mockReturnValue({
			error: null,
			loading: false,
			execute: vi.fn(),
		});
		(validateAll as Mock).mockReturnValue(null);
		const { result } = renderHook(() => usePasswordReset());
		expect(result.current.password).toBe("");
		expect(result.current.confirmPassword).toBe("");
		expect(result.current.validationError).toBeNull();
		expect(result.current.fetchError).toBeNull();
		expect(result.current.isSubmitting).toBe(false);
	});

	it("updates password and confirmPassword", () => {
		(useFetch as Mock).mockReturnValue({
			error: null,
			loading: false,
			execute: vi.fn(),
		});
		(validateAll as Mock).mockReturnValue(null);
		const { result } = renderHook(() => usePasswordReset());
		act(() => {
			result.current.setPassword("newpass");
			result.current.setConfirmPassword("newpass2");
		});
		expect(result.current.password).toBe("newpass");
		expect(result.current.confirmPassword).toBe("newpass2");
	});

	it("validates passwords on change", () => {
		(useFetch as Mock).mockReturnValue({
			error: null,
			loading: false,
			execute: vi.fn(),
		});
		(validateAll as Mock).mockReturnValue("error!");
		const { result } = renderHook(() => usePasswordReset());
		act(() => {
			result.current.setPassword("foo");
			result.current.setConfirmPassword("bar");
		});
		expect(validateAll).toHaveBeenCalledWith("foo", "bar");
		expect(result.current.validationError).toBe("error!");
	});

	it("submits and navigates on success", async () => {
		const execute = vi.fn().mockResolvedValue({ success: true });
		const navigate = vi.fn();
		(useFetch as Mock).mockReturnValue({
			error: null,
			loading: false,
			execute,
		});
		(validateAll as Mock).mockReturnValue(null);
		const routerDom = await import("react-router-dom");
		(
			routerDom as unknown as { useNavigate: () => typeof navigate }
		).useNavigate = () => navigate;
		const { result } = renderHook(() => usePasswordReset());
		const fakeEvent = {
			preventDefault: () => {},
		} as unknown as React.FormEvent<HTMLFormElement>;
		await act(async () => {
			await result.current.handleSubmit(fakeEvent);
		});
		expect(execute).toHaveBeenCalled();
		expect(navigate).toHaveBeenCalledWith("/login");
	});
});
