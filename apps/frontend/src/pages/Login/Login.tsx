import { useState } from "react";
import { Navigate } from "react-router-dom";
import styles from "./Login.module.css";
import MagicLinkLogin from "../../components/auth/MagicLinkLogin";
import PasswordLogin from "../../components/auth/PasswordLogin";

interface Props {
	isAuthenticated?: boolean;
}

export const Login: React.FC<Props> = ({ isAuthenticated }) => {
	const [selectedMethod, setSelectedMethod] = useState<"magic" | "password">(
		"magic"
	);
	if (isAuthenticated) {
		return <Navigate replace to="/" />;
	}

	return (
		<div className={styles.loginContainer} id="login">
			<div className={styles.loginBox}>
				<h1>Welcome to Phishing Mail AI</h1>
				<p>Please log in to continue</p>
				<div className={styles.toggleContainer}>
					<button
						className={`${styles.toggleButton} ${
							selectedMethod === "magic" ? styles.toggleActive : ""
						}`}
						type="button"
						onClick={() => setSelectedMethod("magic")}
					>
						Magic Link
					</button>
					<button
						className={`${styles.toggleButton} ${
							selectedMethod === "password" ? styles.toggleActive : ""
						}`}
						type="button"
						onClick={() => setSelectedMethod("password")}
					>
						Password
					</button>
				</div>
				{selectedMethod === "magic" ? <MagicLinkLogin /> : <PasswordLogin />}
			</div>
		</div>
	);
};
