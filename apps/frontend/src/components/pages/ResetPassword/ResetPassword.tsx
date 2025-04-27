import styles from "./ResetPassword.module.css";
import PasswordReset from "../../auth/PasswordReset";

export const ResetPassword: React.FC = () => {
	return (
		<div className={styles.resetPasswordContainer} id="reset-password">
			<div className={styles.resetPasswordBox}>
				<h1>Reset Password</h1>
				<PasswordReset />
			</div>
		</div>
	);
};
