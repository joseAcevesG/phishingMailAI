import styles from "../../assets/Password.module.css";
import { usePassword } from "./usePassword";

/**
 * Password component renders a form for users to sign up with an email and password.
 *
 * @returns {JSX.Element} The password sign up form.
 */
const Password: React.FC = () => {
	const {
		email,
		setEmail,
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		error,
		loading,
		handlePasswordSignUp,
	} = usePassword();

	return (
		<form className={styles.passwordForm} onSubmit={handlePasswordSignUp}>
			{/* Email input field for user sign up */}
			<div className={styles.inputGroup}>
				<input
					className={styles.emailInput}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Enter your email"
					type="email"
					value={email}
				/>
			</div>
			{/* Password input field for user sign up */}
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Enter your password"
					type="password"
					value={password}
				/>
			</div>
			{/* Confirm password input field to ensure user typed the intended password */}
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					onChange={(e) => setConfirmPassword(e.target.value)}
					placeholder="Confirm your password"
					type="password"
					value={confirmPassword}
				/>
			</div>
			{/* Display error message if present (e.g., passwords do not match) */}
			{error && <p className={styles.errorMessage}>{error}</p>}
			{/* Sign up button is disabled if loading, fields are empty, or there is an error */}
			<button
				className={styles.loginButton}
				disabled={loading || !email || !password || !confirmPassword || !!error}
				type="submit"
			>
				{loading ? "Signing up..." : "Sign Up"}
			</button>
		</form>
	);
};

export default Password;
