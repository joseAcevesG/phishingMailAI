import { Link } from "react-router-dom";
import styles from "./settings.module.css";
import { useSettings } from "./useSettings";

const SettingsPage: React.FC = () => {
	const {
		apiKey,
		setApiKey,
		keyError,
		keyLoading,
		handleKeySubmit,
		logoutError,
		logoutLoading,
		handleLogoutAll,
	} = useSettings();

	return (
		<div className={styles.container}>
			{/* Password Section */}
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

			{/* API Key Section */}
			<section className={styles.section}>
				<div className={styles.header}>
					<h2>OpenAI API Key</h2>
				</div>
				<div className={styles.body}>
					<p>Enter your OpenAI API key to continue using the service.</p>
					{keyError && <div className={styles.errorMessage}>{keyError}</div>}
					<form className={styles.form} onSubmit={handleKeySubmit}>
						<input
							onChange={(e) => setApiKey(e.target.value)}
							placeholder="sk-..."
							required
							type="password"
							value={apiKey}
						/>
						<button disabled={keyLoading || !apiKey} type="submit">
							{keyLoading ? "Saving…" : "Save API Key"}
						</button>
					</form>
				</div>
			</section>

			{/* Danger Zone */}
			<section className={styles.dangerZone}>
				<div className={styles.header}>
					<h2>Danger Zone</h2>
				</div>
				<div className={styles.body}>
					{logoutError && (
						<div className={styles.errorMessage}>{logoutError}</div>
					)}
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
