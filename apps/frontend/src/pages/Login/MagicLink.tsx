import { useMagicLogin } from "../../hooks/useMagicLogin";
import MagicLinkComp from "../../components/magicLink/MagicLink";

const MagicLink: React.FC = () => {
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
		<MagicLinkComp
			email={email}
			setEmail={setEmail}
			isButtonDisabled={isButtonDisabled}
			error={error}
			setError={setError}
			handleMagicLinkRequest={handleMagicLinkRequest}
			buttonText={
				isButtonDisabled
					? `You can resend a magic link in: ${countdown} seconds`
					: "Login with Magic Link"
			}
		/>
	);
};

export default MagicLink;
