import { usePasswordSignUp } from "../../hooks/usePasswordSignUp";
import styles from "./Password.module.css";

const PasswordSignUp: React.FC = () => {
	const {
		email,
		setEmail,
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		error,
		isSubmitting,
		handlePasswordSignUp,
	} = usePasswordSignUp();

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
					placeholder="Confirm your password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
			</div>
			{error && <p className={styles.errorMessage}>{error}</p>}
			<button
				className={styles.loginButton}
				type="submit"
				disabled={
					isSubmitting || !email || !password || !confirmPassword || !!error
				}
			>
				{isSubmitting ? "Signing up..." : "Sign Up"}
			</button>
		</form>
	);
};

export default PasswordSignUp;
