import styles from "../../assets/MagicLink.module.css";

interface Props {
	email: string;
	setEmail: (email: string) => void;
	isButtonDisabled: boolean;
	error: string | null;
	setError: (error: string | null) => void;
	handleMagicLinkRequest: () => void;
	buttonText: string;
}

const MagicLink: React.FC<Props> = ({
	email,
	setEmail,
	isButtonDisabled,
	error,
	setError,
	handleMagicLinkRequest,
	buttonText,
}) => {
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
				{buttonText}
			</button>
		</form>
	);
};

export default MagicLink;
