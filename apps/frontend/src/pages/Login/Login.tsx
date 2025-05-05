import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import ToggleButtonGroup from "../../components/ToggleButtonGroup/ToggleButtonGroup";
import MagicLink from "../../components/magicLink/MagicLink";
import type { APIAuth } from "../../types";
import styles from "./Login.module.css";
import Password from "./Password";

interface Props {
	isAuthenticated?: boolean;
	onAuthenticate: (data: APIAuth) => void;
}

/**
 * Login component for authenticating users.
 *
 * This component renders a login form for users to authenticate
 * using either a magic link or password. It switches between the
 * two methods based on user selection and provides appropriate
 * options for each method. If the user is already authenticated,
 * it redirects to the home page. It also includes navigation links
 * for password reset and account signup.
 *
 * @param {boolean} isAuthenticated - Indicates if the user is already authenticated.
 * @param {(data: APIAuth) => void} onAuthenticate - Callback function to handle authentication.
 */
export const Login: React.FC<Props> = ({ isAuthenticated, onAuthenticate }) => {
	const [selectedMethod, setSelectedMethod] = useState<"magic" | "password">(
		"magic"
	);

	// If the user is already authenticated, redirect to the home page
	if (isAuthenticated) {
		return <Navigate replace to="/" />;
	}

	return (
		<div className={styles.loginContainer} id="login">
			<div className={styles.loginBox}>
				<h1>Welcome to Phishing Mail AI</h1>
				<p>Please log in to continue</p>
				{/* Toggle buttons to switch between magic link and password login methods */}
				<ToggleButtonGroup
					selectedMethod={selectedMethod}
					setSelectedMethod={setSelectedMethod}
				/>
				{/* Conditionally render the login method component based on selection */}
				{selectedMethod === "magic" ? (
					<MagicLink
						buttonText={"Login with Magic Link"}
						url={"/api/auth/login"}
					/>
				) : (
					<Password onAuthenticate={onAuthenticate} />
				)}
				<div className={styles.linkContainer}>
					{/* Show password reset link only for password login method */}
					{selectedMethod === "password" && (
						<Link className={styles.link} to="/reset-password-link">
							Forgot your password?
						</Link>
					)}
					{/* Signup link is always shown */}
					<Link className={styles.link} to="/signup">
						Don't have an account?
					</Link>
				</div>
			</div>
		</div>
	);
};
