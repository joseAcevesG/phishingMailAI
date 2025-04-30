import { Link } from "react-router-dom";
import { useSettings } from "./useSettings";
import styles from "./settings.module.css";

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
					<Link type="button" className={styles.link} to="/reset-password-link">
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
							type="password"
							placeholder="sk-..."
							value={apiKey}
							required
							onChange={(e) => setApiKey(e.target.value)}
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
						type="button"
						className={styles.dangerButton}
						onClick={handleLogoutAll}
						disabled={logoutLoading}
					>
						{logoutLoading ? "Logging out…" : "Log out on all devices"}
					</button>
				</div>
			</section>
		</div>
	);
};

export default SettingsPage;
