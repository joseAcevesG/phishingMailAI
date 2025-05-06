import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import type { APIAuth, APIMessage } from "../../types";

/**
 * A custom hook that manages settings for API key and logout functionality.
 *
 * This hook provides:
 * - `apiKey`: The current API key.
 * - `setApiKey`: A function to update the API key.
 * - `keyError`: Any error encountered while saving the API key.
 * - `keyLoading`: A loading state for the API key submission.
 * - `handleKeySubmit`: A function to handle API key submission.
 * - `logoutError`: Any error encountered while logging out from all devices.
 * - `logoutLoading`: A loading state for the logout process.
 * - `handleLogoutAll`: A function to handle logging out from all devices.
 *
 * The hook uses `useFetch` for API requests and `useNavigate` for navigation.
 */
export function useSettings(onAuthenticate: (data: APIAuth) => void) {
	const [apiKey, setApiKey] = useState("");
	const navigate = useNavigate();

	// change trial / save key
	const {
		execute: saveKey,
		error: keyError,
		loading: keyLoading,
	} = useFetch<APIMessage>(
		{ url: "/api/auth/change-trial", method: "POST" },
		false,
	);

	// logout everywhere
	const {
		execute: logoutAll,
		error: logoutError,
		loading: logoutLoading,
	} = useFetch<APIMessage>(
		{ url: "/api/auth/logout-all", method: "POST" },
		false,
	);

	/**
	 * Handles the API key submission form.
	 *
	 * Prevents the default form submission behavior, and calls the `saveKey` function with the current API key.
	 * If the request is successful, navigates to the root page.
	 *
	 * @param e The form submission event.
	 */
	const handleKeySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const res = await saveKey({ body: { api_key: apiKey } });
		if (res) navigate("/");
	};

	/**
	 * Handles the logout from all devices form.
	 *
	 * Calls the `logoutAll` function and navigates to the login page if the request is successful.
	 */
	const handleLogoutAll = async () => {
		const res = await logoutAll();
		if (res) {
			onAuthenticate({
				authenticated: false,
			});
			navigate("/login");
		}
	};

	return {
		apiKey,
		setApiKey,
		keyError,
		keyLoading,
		handleKeySubmit,
		logoutError,
		logoutLoading,
		handleLogoutAll,
	};
}
