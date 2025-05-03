import { useAuthenticate } from "./useAuthenticate";
import type { APIAuth } from "../../types";
import styles from "./Authenticate.module.css";

interface Props {
	onAuthenticate: (data: APIAuth) => void;
}

export const Authenticate: React.FC<Props> = ({ onAuthenticate }) => {
	useAuthenticate(onAuthenticate);

	return (
		<div className={styles.authenticateContainer}>
			<p>Authenticating...</p>
		</div>
	);
};
