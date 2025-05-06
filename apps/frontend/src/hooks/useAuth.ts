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
		if (result) {
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
			userEmail: data.email ?? null,
		}));
	}, []);

	// Fetches the authentication status from the API and updates the authentication state
	// every 5 minutes
	useEffect(() => {
		let isMounted = true;

		const handleStatus = async () => {
			if (!isMounted) return;
			setState((prev) => ({ ...prev, loading: true }));

			try {
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
			} catch (err) {
				console.error("Status check failed", err);
				setState((prev) => ({
					...prev,
					isAuthenticated: false,
					userEmail: null,
				}));
			} finally {
				if (isMounted) {
					setState((prev) => ({ ...prev, loading: false }));
				}
			}
		};

		// run immediately once
		handleStatus();

		// then every 5 minutes
		const intervalId = setInterval(handleStatus, 5 * 60 * 1000);

		return () => {
			isMounted = false;
			clearInterval(intervalId);
		};
	}, [fetchStatus, handleAuthenticate]);

	return {
		...state,
		handleLogout,
		handleAuthenticate,
	};
};
