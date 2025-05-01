import styles from "../../assets/Password.module.css";
import type { APIAuth } from "../../types";
import { usePassword } from "./usePassword";

interface Props {
	onAuthenticate: (data: APIAuth) => void;
}

const Password: React.FC<Props> = ({ onAuthenticate }) => {
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
	} = usePassword({ onAuthenticate });

	return (
		<form className={styles.passwordForm} onSubmit={handlePasswordSignUp}>
			<div className={styles.inputGroup}>
				<input
					className={styles.emailInput}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Enter your email"
					type="email"
					value={email}
				/>
			</div>
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
			{error && <p className={styles.errorMessage}>{error}</p>}
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
