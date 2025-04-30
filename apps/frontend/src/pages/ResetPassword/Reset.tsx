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
			{(validationError || fetchError) && (
				<p className={styles.errorMessage}>{validationError || fetchError}</p>
			)}
			<button
				className={styles.loginButton}
				type="submit"
				disabled={isSubmitting || !!validationError}
			>
				{isSubmitting ? "Resetting..." : "Reset Password"}
			</button>
		</form>
	);
};

export default PasswordReset;
