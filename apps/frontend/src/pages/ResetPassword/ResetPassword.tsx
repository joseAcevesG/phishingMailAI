import Reset from "./Reset";
import styles from "./ResetPassword.module.css";

/**
 * ResetPassword component renders a form for users to reset their password.
 */
const ResetPassword: React.FC = () => {
	return (
		<div className={styles.resetPasswordContainer} id="reset-password">
			<div className={styles.resetPasswordBox}>
				<h1>Reset Password</h1>
				<Reset />
			</div>
		</div>
	);
};

export default ResetPassword;
