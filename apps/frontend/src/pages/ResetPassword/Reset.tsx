import styles from "../../assets/Password.module.css";
import { usePasswordReset } from "./usePasswordReset";

/**
 * Form component for resetting the user's password.
 *
 * Uses the `usePasswordReset` hook to handle state and submission of the form.
 *
 * @returns {JSX.Element} The password reset form.
 */
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
			{/* Password input field */}
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Enter your password"
					type="password"
					value={password}
				/>
			</div>
			{/* Confirm password input field */}
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					onChange={(e) => setConfirmPassword(e.target.value)}
					placeholder="Confirm your password"
					type="password"
					value={confirmPassword}
				/>
			</div>
			{/* Show validation or fetch error if present */}
			{(validationError || fetchError) && (
				<p className={styles.errorMessage}>{validationError || fetchError}</p>
			)}
			{/* Submit button is disabled while submitting or if validation error exists */}
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
