import type { APIAuth } from "../../types";
import styles from "./Authenticate.module.css";
import { useAuthenticate } from "./useAuthenticate";

interface Props {
	onAuthenticate: (data: APIAuth) => void;
}

/**
 * Page component for authenticating the user.
 *
 * This page is used after a user clicks on a magic link or
 * submits a login form. It is responsible for calling the
 * authentication hook and rendering a message to indicate
 * that the user is being authenticated.
 *
 * @param {{ onAuthenticate: (data: APIAuth) => void }} props
 *   The props object, containing the `onAuthenticate` function
 *   which is used to handle the authentication result.
 *
 * @returns A JSX element representing the Authenticate page.
 */
export const Authenticate: React.FC<Props> = ({ onAuthenticate }) => {
	// Use the useAuthenticate hook to authenticate the user
	useAuthenticate(onAuthenticate);

	return (
		<div className={styles.authenticateContainer}>
			<p>Authenticating...</p>
		</div>
	);
};
