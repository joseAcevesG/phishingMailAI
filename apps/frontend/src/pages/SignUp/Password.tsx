import { usePassword } from "./usePassword";
import styles from "../../assets/Password.module.css";
import type { APIAuth } from "../../types";

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
				disabled={loading || !email || !password || !confirmPassword || !!error}
			>
				{loading ? "Signing up..." : "Sign Up"}
			</button>
		</form>
	);
};

export default Password;
