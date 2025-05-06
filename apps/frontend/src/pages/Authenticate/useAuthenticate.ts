import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import type { APIAuth } from "../../types";

/**
 * A custom hook that manages user authentication based on query parameters.
 *
 * This hook performs the following actions:
 * - Uses the `useFetch` hook to handle the authentication API call.
 * - Uses the `useAuth` hook to validate the authentication status.
 * - Navigates to the login page if no query string is present or if authentication fails.
 *
 * The hook executes the authentication request on mount by sending a POST request to
 * `/api/auth/authenticate` with the current query string as parameters. If the authentication
 * is successful, it updates the authentication status; otherwise, it redirects the user to
 * the login page.
 */
export function useAuthenticate() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	// Use the useFetch hook to fetch the authentication data
	const { execute } = useFetch<APIAuth>(
		{ url: "/api/auth/authenticate", method: "POST" },
		false,
	);
	const { validateStatus } = useAuth();

	// Call execute on mount
	useEffect(() => {
		const queryString = searchParams.toString();
		const handleAuthenticate = () => {
			execute({
				url: `/api/auth/authenticate?${queryString}`,
			})
				.then((result) => {
					if (result) validateStatus(result);
					else navigate("/login");
				})
				.catch(() => {
					navigate("/login");
				});
		};

		// If there is no query string, navigate to the login page
		if (!queryString) {
			navigate("/login");
			return;
		}

		handleAuthenticate();
	}, [execute, navigate, validateStatus, searchParams]);
}
