import MagicLink from "../../components/magicLink/MagicLink";
import styles from "./ResetLink.module.css";

/**
 * ResetLink component renders a form for users to request a password reset link.
 */
export const ResetLink: React.FC = () => {
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
