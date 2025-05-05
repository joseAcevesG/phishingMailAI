import { usePasswordLogin } from "./usePasswordLogin";
import { authTypes } from "shared/auth-types";
import styles from "../../assets/Password.module.css";
import type { APIAuth } from "../../types";

interface Props {
	onAuthenticate: (data: APIAuth) => void;
}

/**
 * Form component for password-based login.
 *
 * Uses the `usePasswordLogin` hook to handle state and submission of the form.
 *
 * @param {Props} props Component props.
 * @param {function(APIAuth)} props.onAuthenticate Callback function to call when the user is
 *                                                  authenticated. Receives the user's auth data
 *                                                  as an argument.
 *
 * @returns {JSX.Element} The password login form.
 */
const Password: React.FC<Props> = ({ onAuthenticate }) => {
	const {
		email,
		setEmail,
		password,
		setPassword,
		error,
		isSubmitting,
		handlePasswordLogin,
	} = usePasswordLogin({ onAuthenticate, authType: authTypes.passwordLogin });

	return (
		<form className={styles.passwordForm} onSubmit={handlePasswordLogin}>
			{/* Email input field */}
			<div className={styles.inputGroup}>
				<input
					className={styles.emailInput}
					onChange={(e) => setEmail(e.target.value)}
					value={email}
					placeholder="Email"
					type="email"
					required
				/>
			</div>
			{/* Password input field */}
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					onChange={(e) => setPassword(e.target.value)}
					value={password}
					placeholder="Password"
					type="password"
					required
				/>
			</div>
			{/* Show error message if login fails */}
			{error && <div className={styles.error}>{error}</div>}
			{/* Submit button is disabled while submitting */}
			<button
				className={styles.submitBtn}
				type="submit"
				disabled={isSubmitting}
			>
				{isSubmitting ? "Logging in..." : "Login"}
			</button>
		</form>
	);
};

export default Password;
