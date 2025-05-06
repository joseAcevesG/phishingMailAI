import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authTypes } from "shared/auth-types";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { validateAll } from "../../services/validatePassword";
import type { APIAuth } from "../../types";

/**
 * Handles password signup functionality for the signup page.
 *
 * @returns An object with the following properties:
 *   - `email`: The email address of the user to sign up
 *   - `setEmail`: A function to set the email address
 *   - `password`: The password of the user to sign up
 *   - `setPassword`: A function to set the password
 *   - `confirmPassword`: The confirmed password of the user to sign up
 *   - `setConfirmPassword`: A function to set the confirmed password
 *   - `error`: An error message if the signup fails
 *   - `loading`: A boolean indicating whether the signup is in progress
 *   - `handlePasswordSignUp`: A function to handle the signup form submission
 */
export function usePassword() {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const { validateStatus } = useAuth();

	// useFetch hook for making signup API requests
	const {
		execute,
		error: fetchError,
		loading,
	} = useFetch<APIAuth>(
		{
			url: "/api/auth/signup",
			method: "POST",
		},
		false,
	);

	// Validate passwords whenever password or confirmPassword changes
	useEffect(() => {
		setError(validateAll(password, confirmPassword));
	}, [password, confirmPassword]);

	/**
	 * Handles the signup form submission.
	 *
	 * Prevents the default form submission behavior, calls the `execute` function with the current
	 * email, password, and type (password_login), and calls the `onAuthenticate` function if the
	 * signup is successful. Navigates to the root route afterward.
	 *
	 * If the signup fails, sets the error state to an error message.
	 *
	 * @param e The form submission event.
	 */
	const handlePasswordSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		const result = await execute({
			body: { email, password, type: authTypes.passwordLogin },
		});
		if (result) {
			validateStatus(result);
			navigate("/");
		} else {
			setError(fetchError || "Signup failed. Please try again.");
		}
	};

	return {
		email,
		setEmail,
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		error,
		loading,
		handlePasswordSignUp,
	};
}
