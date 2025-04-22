import { useState } from "react";
import { Navigate } from "react-router-dom";
import styles from "./SignUp.module.css";
import MagicLinkLogin from "../../components/Login/MagicLinkLogin";
import PasswordSignUp from "../../components/Login/PasswordSignUp";

interface Props {
	isAuthenticated?: boolean;
}

export const SignUp: React.FC<Props> = ({ isAuthenticated }) => {
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
				{selectedMethod === "magic" ? <MagicLinkLogin /> : <PasswordSignUp />}
			</div>
		</div>
	);
};

export default SignUp;
