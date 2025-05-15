import { authTypes } from "shared/auth-types";
import styles from "../../assets/Password.module.css";
import { usePasswordLogin } from "./usePasswordLogin";

/**
 * Form component for password-based login.
 *
 * Uses the `usePasswordLogin` hook to handle state and submission of the form.
 *
 * @returns {JSX.Element} The password login form.
 */
const Password: React.FC = () => {
	const {
		email,
		setEmail,
		password,
		setPassword,
		error,
		isSubmitting,
		handlePasswordLogin,
	} = usePasswordLogin({ authType: authTypes.passwordLogin });

	return (
		<form
			className={styles.passwordForm}
			data-testid="password-form"
			onSubmit={handlePasswordLogin}
		>
			{/* Email input field */}
			<div className={styles.inputGroup}>
				<input
					className={styles.emailInput}
					name="email"
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Email"
					required
					type="email"
					value={email}
				/>
			</div>
			{/* Password input field */}
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					name="password"
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Password"
					required
					type="password"
					value={password}
				/>
			</div>
			{/* Show error message if login fails */}
			{error && <div className={styles.errorMessage}>{error}</div>}
			{/* Submit button is disabled while submitting */}
			<button
				className={styles.submitBtn}
				disabled={isSubmitting}
				type="submit"
			>
				{isSubmitting ? "Logging in..." : "Login"}
			</button>
		</form>
	);
};

export default Password;
