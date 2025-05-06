import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import type { APIAuth } from "../../types";

export interface UsePasswordLoginOptions {
	authType: string;
}

/**
 * Handles password login functionality for the login page.
 *
 * @param options An object with the following properties:
 *   - `onAuthenticate`: A function that will be called with the
 *     authentication data if the login is successful
 *   - `authType`: The authentication type to use for the login
 *     (e.g. "password_login")
 *
 * @returns An object with the following properties:
 *   - `email`: The email address of the user to log in
 *   - `setEmail`: A function to set the email address
 *   - `password`: The password of the user to log in
 *   - `setPassword`: A function to set the password
 *   - `error`: An error message if the login fails
 *   - `isSubmitting`: A boolean indicating whether the login is in progress
 *   - `handlePasswordLogin`: A function to handle the login form submission
 */
export function usePasswordLogin({ authType }: UsePasswordLoginOptions) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { validateStatus } = useAuth();
	// Fetch hook for handling API requests
	const {
		error,
		loading: isSubmitting,
		execute,
	} = useFetch<APIAuth>(
		{
			url: "/api/auth/login",
			method: "POST",
			headers: { "Content-Type": "application/json" },
		},
		false,
	);
	const navigate = useNavigate();

	/**
	 * Handles the login form submission.
	 *
	 * @param e The form event that triggered this function.
	 *
	 * Submits the login form and calls the `onAuthenticate` function if the login is successful.
	 * Navigates to the root route afterward.
	 */
	const handlePasswordLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await execute({
			body: { email, password, type: authType },
		});
		if (result) {
			validateStatus(result);
			navigate("/");
		}
	};

	return {
		email,
		setEmail,
		password,
		setPassword,
		error,
		isSubmitting,
		handlePasswordLogin,
	};
}
