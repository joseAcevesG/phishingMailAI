import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { APIMessage, AuthState } from "../types";
import type { APIAuth } from "../types";
import { useFetch } from "./useFetch";

/**
 * Handles authentication state and related actions.
 *
 * @returns an object with the following properties:
 *
 * - `isAuthenticated`: a boolean indicating whether the user is authenticated
 * - `userEmail`: the email address of the authenticated user, or null if not authenticated
 * - `loading`: a boolean indicating whether the authentication status is being retrieved
 * - `handleLogout`: a function that logs out the user and navigates to the login page
 * - `handleAuthenticate`: a function that updates the authentication state based on the given
 *   authentication data
 */

export const useAuth = () => {
	const [state, setState] = useState<AuthState>({
		isAuthenticated: true,
		userEmail: null,
		loading: true,
	});
	const navigate = useNavigate();

	// Fetch hooks for logout
	const { execute: executeLogout } = useFetch<APIMessage>(
		{
			url: "/api/auth/logout",
			method: "POST",
		},
		false,
	);

	// Fetch hook for authentication status
	const { execute: fetchStatus } = useFetch<APIAuth>(
		{
			url: "/api/auth/status",
		},
		false,
	);

	/**
	 * Logs out the user by executing the logout API call, updating the authentication
	 * state to unauthenticated, and navigating to the login page upon success.
	 */
	const handleLogout = useCallback(async () => {
		const result = await executeLogout();
		if (result !== null) {
			setState((prev) => ({
				...prev,
				isAuthenticated: false,
				userEmail: null,
			}));
			navigate("/login", { replace: true });
		}
	}, [executeLogout, navigate]);

	/**
	 * Updates the authentication state by taking the `authenticated` and `email` properties
	 * from the given `APIAuth` object and merging them into the current state.
	 *
	 * @param data - The `APIAuth` object containing the `authenticated` and `email` properties.
	 */
	const handleAuthenticate = useCallback((data: APIAuth) => {
		setState((prev) => ({
			...prev,
			isAuthenticated: data.authenticated,
			userEmail: data.email,
		}));
	}, []);

	/**
	 * Fetches the authentication status from the API and updates the authentication state
	 * accordingly. If the status is fetched successfully, the authentication state is updated
	 * with the `authenticated` and `email` properties from the response. If the status is not
	 * fetched successfully, the authentication state is set to unauthenticated.
	 */
	useEffect(() => {
		const handleStatus = async () => {
			setState((prev) => ({ ...prev, loading: true }));
			const result = await fetchStatus();
			if (result) {
				handleAuthenticate(result);
			} else {
				setState((prev) => ({
					...prev,
					isAuthenticated: false,
					userEmail: null,
				}));
			}
			setState((prev) => ({ ...prev, loading: false }));
		};
		handleStatus();
	}, [fetchStatus, handleAuthenticate]);

	return {
		...state,
		handleLogout,
		handleAuthenticate,
	};
};
