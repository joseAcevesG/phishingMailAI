import { Navigate } from "react-router-dom";
import MagicLink from "../../components/magicLink/MagicLink";
import styles from "./ResetLink.module.css";

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
				<MagicLink
					buttonText={"Reset Password"}
					url={"/api/auth/reset-password"}
				/>
			</div>
		</div>
	);
};
