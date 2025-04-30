import { useMagicPassword } from "../../hooks/useMagicPassword";
import MagicLinkComp from "../../components/magicLink/MagicLink";

export const MagicLink: React.FC = () => {
	const {
		email,
		setEmail,
		isButtonDisabled,
		countdown,
		error,
		setError,
		handleMagicLinkRequest,
	} = useMagicPassword(15);

	return (
		<MagicLinkComp
			email={email}
			setEmail={setEmail}
			isButtonDisabled={isButtonDisabled}
			error={error}
			setError={setError}
			handleMagicLinkRequest={handleMagicLinkRequest}
			buttonText={
				isButtonDisabled
					? `You can resend a password reset in: ${countdown} seconds`
					: "Reset Password"
			}
		/>
	);
};

export default MagicLink;
