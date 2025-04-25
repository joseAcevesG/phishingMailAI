import { useState } from "react";
import styles from "./Password.module.css";
import { useNavigate } from "react-router-dom";
import ErrorMessages from "../../types/error-messages";
import { authTypes } from "shared/auth-types";

interface Props {
	onAuthenticate: (data: { authenticated: boolean; email: string }) => void;
}

const PasswordLogin: React.FC<Props> = ({ onAuthenticate }) => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const navigate = useNavigate();

	const handlePasswordLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		const controller = new AbortController();
		try {
			const response = await fetch("/api/auth/login", {
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
				throw new Error(errorData.message || ErrorMessages.FAILED_TO_LOGIN);
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
					: "Login failed. Please try again."
			);
		} finally {
			setIsSubmitting(false);
			controller.abort();
		}
	};

	return (
		<form className={styles.passwordForm} onSubmit={handlePasswordLogin}>
			<div className={styles.inputGroup}>
				<input
					className={styles.emailInput}
					type="email"
					placeholder="Enter your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</div>
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					type="password"
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			{error && <p className={styles.errorMessage}>{error}</p>}
			<button
				className={styles.loginButton}
				type="submit"
				disabled={isSubmitting || !email || !password}
			>
				{isSubmitting ? "Logging in..." : "Login"}
			</button>
		</form>
	);
};

export default PasswordLogin;
