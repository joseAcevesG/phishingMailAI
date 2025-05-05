import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import type { APIAuth } from "../../types";

/**
 * Handles authentication based on the query string.
 *
 * @param {Function} onAuthenticate - Called with the authentication data if
 *   the authentication is successful. If the authentication fails, the user
 *   is redirected to the login page.
 */
export function useAuthenticate(onAuthenticate: (data: APIAuth) => void) {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	// Use the useFetch hook to fetch the authentication data
	const { execute } = useFetch<APIAuth>(
		{ url: "/api/auth/authenticate", method: "POST" },
		false,
	);

	// Call execute on mount
	useEffect(() => {
		const queryString = searchParams.toString();
		const handleAuthenticate = () => {
			execute({
				url: `/api/auth/authenticate?${queryString}`,
			})
				.then((result) => {
					if (result) onAuthenticate(result);
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
	}, [execute, navigate, onAuthenticate, searchParams]);
}
