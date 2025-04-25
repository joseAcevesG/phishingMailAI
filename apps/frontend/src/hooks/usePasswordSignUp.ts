import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authTypes } from "shared/auth-types";
import ErrorMessages from "../types/error-messages";

const LUDS_MIN_LENGTH = 8;
const LUDS_REQUIRED_TYPES = 4;

interface Props {
	onAuthenticate: (data: { authenticated: boolean; email: string }) => void;
}

const validatePassword = (password: string) => {
	const errors: string[] = [];
	if (password.length < LUDS_MIN_LENGTH) {
		errors.push(
			`The password must have at least ${LUDS_MIN_LENGTH} characters.`,
		);
	}
	const checks = {
		lower: /[a-z]/.test(password),
		upper: /[A-Z]/.test(password),
		digit: /\d/.test(password),
		symbol: /[^A-Za-z0-9]/.test(password),
	};
	const passedTypes = Object.values(checks).filter(Boolean).length;
	if (passedTypes < LUDS_REQUIRED_TYPES) {
		errors.push(
			`The password must contain at least ${LUDS_REQUIRED_TYPES} of the following types: lowercase letters, uppercase letters, digits, symbols.`,
		);
	}
	return errors;
};

export function usePasswordSignUp({ onAuthenticate }: Props) {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const navigate = useNavigate();

	const validateAll = useCallback(() => {
		console.log("Validating password...");
		if (!(password || confirmPassword)) return null;
		if (confirmPassword && password !== confirmPassword) {
			return "Passwords do not match.";
		}
		const pwdErrors = validatePassword(password);
		if (pwdErrors.length > 0) {
			return pwdErrors.join(" ");
		}
		return null;
	}, [password, confirmPassword]);

	useEffect(() => {
		setError(validateAll());
	}, [validateAll]);

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
