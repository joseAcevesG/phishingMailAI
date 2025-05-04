import styles from "../../assets/Password.module.css";
import { usePasswordReset } from "./usePasswordReset";

const PasswordReset: React.FC = () => {
	const {
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		validationError,
		fetchError,
		isSubmitting,
		handleSubmit,
	} = usePasswordReset();

	return (
		<form data-testid="reset-password-form" onSubmit={handleSubmit}>
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Enter your password"
					type="password"
					value={password}
				/>
			</div>
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					onChange={(e) => setConfirmPassword(e.target.value)}
					placeholder="Confirm your password"
					type="password"
					value={confirmPassword}
				/>
			</div>
			{(validationError || fetchError) && (
				<p className={styles.errorMessage}>{validationError || fetchError}</p>
			)}
			<button
				className={styles.loginButton}
				disabled={isSubmitting || !!validationError}
				type="submit"
			>
				{isSubmitting ? "Resetting..." : "Reset Password"}
			</button>
		</form>
	);
};

export default PasswordReset;
