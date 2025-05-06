import { Link } from "react-router-dom";
import styles from "./settings.module.css";
import { useSettings } from "./useSettings";
import type { APIAuth } from "../../types";

/**
 * Renders the settings page, which includes sections for resetting
 * password, managing the OpenAI API key, and a danger zone for logging
 * out from all devices.
 *
 * The page utilizes the `useSettings` hook to handle state and actions
 * related to API key and logout functionalities. It displays any errors
 * that occur during these processes and provides feedback on loading
 * states.
 */
interface Props {
	onAuthenticate: (data: APIAuth) => void;
}
const SettingsPage: React.FC<Props> = ({ onAuthenticate }) => {
	const {
		apiKey,
		setApiKey,
		keyError,
		keyLoading,
		handleKeySubmit,
		logoutError,
		logoutLoading,
		handleLogoutAll,
	} = useSettings(onAuthenticate);

	return (
		<div className={styles.container}>
			{/* Password Section: Allows users to reset their password if forgotten */}
			<section className={styles.section}>
				<div className={styles.header}>
					<h2>Password</h2>
				</div>
				<div className={styles.body}>
					<p>If you've forgotten your password, you can reset it here:</p>
					<Link className={styles.link} to="/reset-password-link" type="button">
						Reset password
					</Link>
				</div>
			</section>

			{/* API Key Section: Manage OpenAI API key for service access */}
			<section className={styles.section}>
				<div className={styles.header}>
					<h2>OpenAI API Key</h2>
				</div>
				<div className={styles.body}>
					<p>Enter your OpenAI API key to continue using the service.</p>
					{/* Show error if API key is invalid or rejected by backend */}
					{keyError && <div className={styles.errorMessage}>{keyError}</div>}
					<form className={styles.form} onSubmit={handleKeySubmit}>
						<input
							onChange={(e) => setApiKey(e.target.value)}
							placeholder="sk-..."
							required
							type="password"
							value={apiKey}
						/>
						{/* Disable button if loading or API key is empty */}
						<button disabled={keyLoading || !apiKey} type="submit">
							{keyLoading ? "Saving…" : "Save API Key"}
						</button>
					</form>
				</div>
			</section>

			{/* Danger Zone: Allows users to log out from all devices */}
			<section className={styles.dangerZone}>
				<div className={styles.header}>
					<h2>Danger Zone</h2>
				</div>
				<div className={styles.body}>
					{/* Show error if logout fails */}
					{logoutError && (
						<div className={styles.errorMessage}>{logoutError}</div>
					)}
					{/* Button to log out from all devices, disabled while loading */}
					<button
						className={styles.dangerButton}
						disabled={logoutLoading}
						onClick={handleLogoutAll}
						type="button"
					>
						{logoutLoading ? "Logging out…" : "Log out on all devices"}
					</button>
				</div>
			</section>
		</div>
	);
};

export default SettingsPage;
