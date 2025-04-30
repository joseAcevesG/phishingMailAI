import styles from "../../assets/MagicLink.module.css";
import { useMagicLogin } from "../../hooks/useMagicLogin";

export const MagicLinkLogin: React.FC = () => {
	const {
		email,
		setEmail,
		isButtonDisabled,
		countdown,
		error,
		setError,
		handleMagicLinkRequest,
	} = useMagicLogin(15);

	return (
		<form
			className={styles.magicLinkForm}
			onSubmit={(e) => {
				e.preventDefault();
				handleMagicLinkRequest();
			}}
		>
			<div className={styles.inputGroup}>
				<input
					className={styles.emailInput}
					onChange={(e) => {
						setEmail(e.target.value);
						setError(null);
					}}
					placeholder="Enter your email"
					type="email"
					value={email}
				/>
			</div>
			{error && <p className={styles.errorMessage}>{error}</p>}
			<button
				className={styles.loginButton}
				disabled={isButtonDisabled || email.length === 0}
				type="submit"
			>
				{isButtonDisabled
					? `You can resend a magic link in: ${countdown} seconds`
					: "Login with Magic Link"}
			</button>
		</form>
	);
};

export default MagicLinkLogin;
