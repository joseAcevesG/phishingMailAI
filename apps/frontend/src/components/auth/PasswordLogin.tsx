import { useState } from "react";
import styles from "./Password.module.css";

const PasswordLogin: React.FC = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const handlePasswordLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		try {
			// TODO: implement password login logic
			console.log("Logging in with", email, password);
		} catch (_err) {
			setError("Login failed. Please try again.");
		} finally {
			setIsSubmitting(false);
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
