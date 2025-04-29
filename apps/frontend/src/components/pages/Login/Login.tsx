import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import styles from "./Login.module.css";
import MagicLinkLogin from "../../auth/MagicLinkLogin";
import PasswordLogin from "../../auth/PasswordLogin";
import type { APIAuth } from "../../../types";

interface Props {
	isAuthenticated?: boolean;
	onAuthenticate: (data: APIAuth) => void;
}

export const Login: React.FC<Props> = ({ isAuthenticated, onAuthenticate }) => {
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
				{selectedMethod === "magic" ? (
					<MagicLinkLogin />
				) : (
					<PasswordLogin onAuthenticate={onAuthenticate} />
				)}
				<div className={styles.linkContainer}>
					{selectedMethod === "password" && (
						<Link className={styles.link} to="/reset-password-link">
							Forgot your password?
						</Link>
					)}
					<Link className={styles.link} to="/signup">
						Don't have an account?
					</Link>
				</div>
			</div>
		</div>
	);
};
