import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import type { APIMessage } from "../../types";

/**
 * A custom hook that provides information and a logout function for the header
 * bar.
 *
 * The hook uses `useAuth` for the current user's email and `useFetch` for the
 * logout function.
 *
 * @returns An object containing the current user's email and a logout function.
 */
export function useHeaderAuth() {
	const { userEmail, validateStatus } = useAuth();
	const { execute: executeLogout } = useFetch<APIMessage>(
		{ url: "/api/auth/logout", method: "POST" },
		false,
	);

	/**
	 * Handles the logout process for the header bar.
	 *
	 * Calls the logout API endpoint and then updates the authentication state
	 * using `validateStatus`.
	 */
	const handleLogout = async () => {
		await executeLogout();
		validateStatus({ authenticated: false });
	};

	return { userEmail, handleLogout };
}
