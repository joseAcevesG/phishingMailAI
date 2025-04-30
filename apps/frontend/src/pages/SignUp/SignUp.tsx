import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import styles from "./SignUp.module.css";
import MagicLink from "../../components/magicLink/MagicLink";
import Password from "./Password";
import ToggleButtonGroup from "../../components/ToggleButtonGroup/ToggleButtonGroup";
import type { APIAuth } from "../../types";

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
				<ToggleButtonGroup
					selectedMethod={selectedMethod}
					setSelectedMethod={setSelectedMethod}
				/>
				{selectedMethod === "magic" ? (
					<MagicLink
						url={"/api/auth/login"}
						buttonText={"Sign up with Magic Link"}
					/>
				) : (
					<Password onAuthenticate={onAuthenticate} />
				)}
				<Link className={styles.link} to="/login">
					Already have an account?
				</Link>
			</div>
		</div>
	);
};

export default SignUp;
