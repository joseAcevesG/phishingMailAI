import styles from "./MagicLink.module.css";
import { useMagicLink } from "./useMagicLink";

interface Props {
	buttonText: string;
	url: string;
}

const MagicLink: React.FC<Props> = ({ buttonText, url }) => {
	const {
		email,
		setEmail,
		isButtonDisabled,
		countdown,
		error,
		setError,
		handleMagicLinkRequest,
	} = useMagicLink({ url });

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
					: buttonText}
			</button>
		</form>
	);
};

export default MagicLink;
