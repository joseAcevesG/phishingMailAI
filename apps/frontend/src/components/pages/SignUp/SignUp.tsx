import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import styles from "./SignUp.module.css";
import MagicLinkLogin from "../../auth/MagicLinkLogin";
import PasswordSignUp from "../../auth/PasswordSignUp";
import type { APIAuth } from "../../../types";

interface Props {
	isAuthenticated?: boolean;
	onAuthenticate: (data: APIAuth) => void;
}

export const SignUp: React.FC<Props> = ({
	isAuthenticated,
	onAuthenticate,
}) => {
	const [selectedMethod, setSelectedMethod] = useState<"magic" | "password">(
		"magic"
	);
	if (isAuthenticated) {
		return <Navigate replace to="/" />;
	}

	return (
		<div className={styles.signupContainer} id="signup">
			<div className={styles.signupBox}>
				<h1>Welcome to Phishing Mail AI</h1>
				<p>Please sign up to continue</p>
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
					<PasswordSignUp onAuthenticate={onAuthenticate} />
				)}
				<Link className={styles.link} to="/login">
					Already have an account?
				</Link>
			</div>
		</div>
	);
};

export default SignUp;
