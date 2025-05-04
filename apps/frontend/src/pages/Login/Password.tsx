import { usePasswordLogin } from "./usePasswordLogin";
import { authTypes } from "shared/auth-types";
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
		error,
		isSubmitting,
		handlePasswordLogin,
	} = usePasswordLogin({ onAuthenticate, authType: authTypes.passwordLogin });

	return (
		<form className={styles.passwordForm} onSubmit={handlePasswordLogin}>
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
			{error && <div className={styles.error}>{error}</div>}
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
