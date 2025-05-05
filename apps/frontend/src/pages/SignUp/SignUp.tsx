import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import ToggleButtonGroup from "../../components/ToggleButtonGroup/ToggleButtonGroup";
import MagicLink from "../../components/magicLink/MagicLink";
import type { APIAuth } from "../../types";
import Password from "./Password";
import styles from "./SignUp.module.css";

interface Props {
	isAuthenticated?: boolean;
	onAuthenticate: (data: APIAuth) => void;
}

/**
 * SignUp component for user registration.
 *
 * This component renders a signup form for users to register
 * using either a magic link or password. It switches between the
 * two methods based on user selection and provides appropriate
 * options for each method. If the user is already authenticated,
 * it redirects to the home page. It also includes navigation links
 * for login.
 *
 * @param {boolean} isAuthenticated - Indicates if the user is already authenticated.
 * @param {(data: APIAuth) => void} onAuthenticate - Callback function to handle authentication.
 */
export const SignUp: React.FC<Props> = ({
	isAuthenticated,
	onAuthenticate,
}) => {
	const [selectedMethod, setSelectedMethod] = useState<"magic" | "password">(
		"magic"
	);

	// If user is already authenticated, redirect to home page
	if (isAuthenticated) {
		return <Navigate replace to="/" />;
	}

	return (
		<div className={styles.signupContainer} id="signup">
			<div className={styles.signupBox}>
				<h1>Welcome to Phishing Mail AI</h1>
				<p>Please sign up to continue</p>
				{/* Toggle between Magic Link and Password sign up methods */}
				<ToggleButtonGroup
					selectedMethod={selectedMethod}
					setSelectedMethod={setSelectedMethod}
				/>
				{/* Render MagicLink or Password form based on selected method */}
				{selectedMethod === "magic" ? (
					<MagicLink
						buttonText={"Sign up with Magic Link"}
						url={"/api/auth/login"}
					/>
				) : (
					<Password onAuthenticate={onAuthenticate} />
				)}
				{/* Navigation link for users who already have an account */}
				<Link className={styles.link} to="/login">
					Already have an account?
				</Link>
			</div>
		</div>
	);
};

export default SignUp;
