import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { validateAll } from "../../services/validatePassword";
import type { APIMessage } from "../../types";

/**
 * A hook to manage password reset state and submission.
 *
 * This hook returns an object with the following properties:
 * - `password`: The current password input value.
 * - `setPassword`: A function to update the password value.
 * - `confirmPassword`: The current confirm password input value.
 * - `setConfirmPassword`: A function to update the confirm password value.
 * - `validationError`: An error message if the password and confirm password do not match.
 * - `fetchError`: An error message if the password reset request fails.
 * - `isSubmitting`: A boolean indicating if the password reset request is in progress.
 * - `handleSubmit`: A function to handle the password reset form submission, which will call the `/api/auth/authenticate` endpoint and navigate to the login page if the request is successful.
 */
export function usePasswordReset() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	// Fetch hook for handling API requests
	const {
		error: fetchError,
		loading: isSubmitting,
		execute,
	} = useFetch<APIMessage>(
		{
			url: `/api/auth/authenticate?${searchParams.toString()}`,
			method: "POST",
		},
		false,
	);
	// Validate password and confirm password
	useEffect(() => {
		setValidationError(validateAll(password, confirmPassword));
	}, [password, confirmPassword]);

	/**
	 * Handles the password reset form submission.
	 *
	 * Prevents the default form submission behavior, and calls the `execute` function with the current password.
	 * If the request is successful, navigates to the login page.
	 *
	 * @param e The form submission event.
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await execute({ body: { password } });
		if (result) {
			navigate("/login");
		}
	};

	return {
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		validationError,
		fetchError,
		isSubmitting,
		handleSubmit,
	};
}
