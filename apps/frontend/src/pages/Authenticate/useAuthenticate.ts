import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import type { APIAuth } from "../../types";

/**
 * Handles authentication based on the query string.
 *
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
