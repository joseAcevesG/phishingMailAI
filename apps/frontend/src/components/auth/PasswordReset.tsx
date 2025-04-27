import { useEffect, useState } from "react";
import styles from "./Password.module.css";
import { validateAll } from "../../services/validatePassword";
import ErrorMessages from "../../types/error-messages";
import { useSearchParams, useNavigate } from "react-router-dom";

const PasswordReset: React.FC = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	useEffect(() => {
		setError(validateAll(password, confirmPassword));
	}, [password, confirmPassword]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		const controller = new AbortController();
		try {
			const response = await fetch(
				`/api/auth/authenticate?${searchParams.toString()}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						password,
					}),
					signal: controller.signal,
				}
			);
			if (!response.ok) {
				if (response.status >= 500) {
					throw new Error(ErrorMessages.GENERIC_ERROR);
				}
				const errorData = await response.json();
				throw new Error(
					errorData.message || ErrorMessages.FAILED_TO_RESET_PASSWORD
				);
			}
			navigate("/login");
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				// Fetch was aborted, do nothing
				return;
			}
			setError(
				error instanceof Error
					? error.message
					: "Failed to reset password. Please try again."
			);
		} finally {
			setIsSubmitting(false);
			controller.abort();
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					type="password"
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					type="password"
					placeholder="Confirm your password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
			</div>
			{error && <p className={styles.errorMessage}>{error}</p>}
			<button
				className={styles.loginButton}
				type="submit"
				disabled={isSubmitting || !password || !confirmPassword || !!error}
			>
				{isSubmitting ? "Resetting..." : "Reset Password"}
			</button>
		</form>
	);
};

export default PasswordReset;
