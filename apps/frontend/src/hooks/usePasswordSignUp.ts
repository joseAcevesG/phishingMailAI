import { useCallback, useEffect, useState } from "react";

const LUDS_MIN_LENGTH = 8;
const LUDS_REQUIRED_TYPES = 4;

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

export function usePasswordSignUp() {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
		try {
			// TODO: implement password sign up logic
			console.log("Signing up with", email, password);
		} catch (_err) {
			setError("Sign up failed. Please try again.");
		} finally {
			setIsSubmitting(false);
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
