import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authTypes } from "shared/auth-types";
import styles from "../../assets/Password.module.css";
import { useFetch } from "../../hooks/useFetch";
import type { APIAuth } from "../../types";

interface Props {
	onAuthenticate: (data: APIAuth) => void;
}

const Password: React.FC<Props> = ({ onAuthenticate }) => {
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
		false,
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
			{error && <p className={styles.errorMessage}>{error}</p>}
			<button
				className={styles.loginButton}
				disabled={isSubmitting || !email || !password}
				type="submit"
			>
				{isSubmitting ? "Logging in..." : "Login"}
			</button>
		</form>
	);
};

export default Password;
