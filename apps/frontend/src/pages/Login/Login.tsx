import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import styles from "./Login.module.css";
import MagicLink from "../../components/magicLink/MagicLink";
import Password from "./Password";
import type { APIAuth } from "../../types";
import ToggleButtonGroup from "../../components/ToggleButtonGroup/ToggleButtonGroup";

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
				<ToggleButtonGroup
					selectedMethod={selectedMethod}
					setSelectedMethod={setSelectedMethod}
				/>
				{selectedMethod === "magic" ? (
					<MagicLink
						url={"/api/auth/login"}
						buttonText={"Login with Magic Link"}
					/>
				) : (
					<Password onAuthenticate={onAuthenticate} />
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
