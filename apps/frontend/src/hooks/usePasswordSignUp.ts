import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authTypes } from "shared/auth-types";
import { validateAll } from "../services/validatePassword";
import ErrorMessages from "../types/error-messages";

interface Props {
	onAuthenticate: (data: { authenticated: boolean; email: string }) => void;
}

// services

export function usePasswordSignUp({ onAuthenticate }: Props) {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		setError(validateAll(password, confirmPassword));
	}, [password, confirmPassword]);

	const handlePasswordSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		const controller = new AbortController();
		try {
			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					password,
					type: authTypes.passwordLogin,
				}),
				signal: controller.signal,
			});
			if (!response.ok) {
				if (response.status >= 500) {
					throw new Error(ErrorMessages.GENERIC_ERROR);
				}
				const errorData = await response.json();
				throw new Error(errorData.message || ErrorMessages.FAILED_TO_SIGNUP);
			}
			const data = await response.json();
			onAuthenticate(data);
			navigate("/");
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				// Fetch was aborted, do nothing
				return;
			}
			setError(
				error instanceof Error
					? error.message
					: "Signup failed. Please try again.",
			);
		} finally {
			setIsSubmitting(false);
			controller.abort();
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
		isSubmitting,
		handlePasswordSignUp,
	};
}
