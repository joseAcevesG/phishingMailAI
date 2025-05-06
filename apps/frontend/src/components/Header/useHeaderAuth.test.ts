import { act, renderHook } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { useHeaderAuth } from "./useHeaderAuth";

// Mock the useAuth and useFetch hooks to control their behavior in tests
vi.mock("../../hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../hooks/useFetch", () => ({ useFetch: vi.fn() }));

// Cast mocked hooks for type safety and easier usage
const mockedUseAuth = useAuth as unknown as Mock;
const mockedUseFetch = useFetch as unknown as Mock;

describe("useHeaderAuth", () => {
	// Reset mocks before each test to ensure isolation
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test: Should return userEmail from useAuth
	it("returns userEmail from useAuth", () => {
		mockedUseAuth.mockReturnValue({
			userEmail: "foo@bar.com",
			validateStatus: vi.fn(),
		});
		mockedUseFetch.mockReturnValue({ execute: vi.fn() });
		const { result } = renderHook(() => useHeaderAuth());
		expect(result.current.userEmail).toBe("foo@bar.com");
	});

	// Test: Should call executeLogout and validateStatus when handleLogout is called
	it("handleLogout calls executeLogout and validateStatus", async () => {
		// Prepare spies for validateStatus and execute
		const validateStatus = vi.fn();
		const execute = vi.fn().mockResolvedValue({});
		// Simulate useAuth and useFetch returning the spies
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
