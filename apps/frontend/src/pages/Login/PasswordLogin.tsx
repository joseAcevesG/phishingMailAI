import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import styles from "../../assets/Password.module.css";
import { useNavigate } from "react-router-dom";
import { authTypes } from "shared/auth-types";
import type { APIAuth } from "../../types";

interface Props {
	onAuthenticate: (data: APIAuth) => void;
}

const PasswordLogin: React.FC<Props> = ({ onAuthenticate }) => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const {
		error,
		loading: isSubmitting,
		execute,
	} = useFetch<APIAuth>(
		{
			url: "/api/auth/login",
			method: "POST",
			headers: { "Content-Type": "application/json" },
		},
		false
	);
	const navigate = useNavigate();

	const handlePasswordLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await execute({
			body: { email, password, type: authTypes.passwordLogin },
		});
		if (result) {
			onAuthenticate(result);
			navigate("/");
		}
	};

	return (
		<form className={styles.passwordForm} onSubmit={handlePasswordLogin}>
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
			{error && <p className={styles.errorMessage}>{error}</p>}
			<button
				className={styles.loginButton}
				type="submit"
				disabled={isSubmitting || !email || !password}
			>
				{isSubmitting ? "Logging in..." : "Login"}
			</button>
		</form>
	);
};

export default PasswordLogin;
