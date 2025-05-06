import styles from "./Authenticate.module.css";
import { useAuthenticate } from "./useAuthenticate";

/**
 * Page component for authenticating the user.
 *
 * This page is used after a user clicks on a magic link or
 * submits a login form. It is responsible for calling the
 * authentication hook and rendering a message to indicate
 * that the user is being authenticated.
 *
 * @returns A JSX element representing the Authenticate page.
 */
const Authenticate: React.FC = () => {
	// Use the useAuthenticate hook to authenticate the user
	useAuthenticate();

	return (
		<div className={styles.authenticateContainer}>
			<p>Authenticating...</p>
		</div>
	);
};

export default Authenticate;
