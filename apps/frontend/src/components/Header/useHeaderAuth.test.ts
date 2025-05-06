import { act, renderHook } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { useHeaderAuth } from "./useHeaderAuth";

vi.mock("../../hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../hooks/useFetch", () => ({ useFetch: vi.fn() }));

const mockedUseAuth = useAuth as unknown as Mock;
const mockedUseFetch = useFetch as unknown as Mock;

describe("useHeaderAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns userEmail from useAuth", () => {
		mockedUseAuth.mockReturnValue({
			userEmail: "foo@bar.com",
			validateStatus: vi.fn(),
		});
		mockedUseFetch.mockReturnValue({ execute: vi.fn() });
		const { result } = renderHook(() => useHeaderAuth());
		expect(result.current.userEmail).toBe("foo@bar.com");
	});

	it("handleLogout calls executeLogout and validateStatus", async () => {
		const validateStatus = vi.fn();
		const execute = vi.fn().mockResolvedValue({});
		mockedUseAuth.mockReturnValue({ userEmail: "bar@baz.com", validateStatus });
		mockedUseFetch.mockReturnValue({ execute });
		const { result } = renderHook(() => useHeaderAuth());

		await act(async () => {
			await result.current.handleLogout();
		});
		expect(execute).toHaveBeenCalledTimes(1);
		expect(validateStatus).toHaveBeenCalledWith({ authenticated: false });
	});
});
