import styles from "./MagicLink.module.css";
import { useMagicLink } from "./useMagicLink";

interface Props {
	buttonText: string;
	url: string;
}

/**
 * MagicLink component renders a form that allows users to request a magic link
 * for authentication. It accepts buttonText and url as props. The component
 * manages email input, button state, and error messages using the useMagicLink
 * hook. The submit button is disabled if the email is empty or if the magic
 * link request is in progress, displaying a countdown timer when the button is
 * disabled.
 */
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
			// unique identifier for the form
			className={styles.magicLinkForm}
			data-testid="magic-link-form"
			onSubmit={(e) => {
				e.preventDefault();
				handleMagicLinkRequest();
			}}
		>
			<div className={styles.inputGroup}>
				<input
					// input field for email
					className={styles.emailInput}
					// update hook's email state and clear error when input changes
					onChange={(e) => {
						setEmail(e.target.value);
						setError(null);
					}}
					placeholder="Enter your email"
					type="email"
					value={email}
				/>
			</div>
			{/* display error message if error is not null */}
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
