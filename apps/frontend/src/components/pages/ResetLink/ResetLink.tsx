import { Navigate } from "react-router-dom";
import styles from "./ResetLink.module.css";
import MagicLinkPassword from "../../auth/MagicLinkPassword";

interface Props {
	isAuthenticated?: boolean;
}

export const ResetLink: React.FC<Props> = ({ isAuthenticated }) => {
	if (isAuthenticated) {
		return <Navigate replace to="/" />;
	}

	return (
		<div className={styles.loginContainer} id="login">
			<div className={styles.loginBox}>
				<h1>Reset Password</h1>
				<p>Enter your email address to reset your password</p>
				<MagicLinkPassword />
			</div>
		</div>
	);
};
