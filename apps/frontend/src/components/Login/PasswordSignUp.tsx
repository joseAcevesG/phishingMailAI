import { useState } from "react";
import styles from "./Password.module.css";

const PasswordSignUp: React.FC = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const handlePasswordSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		if (password !== confirmPassword) {
			setError("Las contraseñas no coinciden.");
			setIsSubmitting(false);
			return;
		}
		try {
			// TODO: implement password sign up logic
			console.log("Signing up with", email, password);
		} catch (_err) {
			setError("Sign up failed. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className={styles.passwordForm} onSubmit={handlePasswordSignUp}>
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
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					type="password"
					placeholder="Confirma tu contraseña"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
			</div>
			{error && <p className={styles.errorMessage}>{error}</p>}
			<button
				className={styles.loginButton}
				type="submit"
				disabled={isSubmitting || !email || !password || !confirmPassword}
			>
				{isSubmitting ? "Registrando..." : "Sign Up"}
			</button>
		</form>
	);
};

export default PasswordSignUp;
