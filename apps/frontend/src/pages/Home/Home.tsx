import ErrorMessages from "../../types/error-messages";
import styles from "./Home.module.css";
import { UploadForm } from "./UploadForm";
import { useMailAnalysis } from "./useMailAnalysis";

/**
 * The home page of the app, which displays an error message and/or the
 * upload form, depending on the state of the app.
 *
 * If an error has occurred, it displays an error message and a button to
 * either set an OpenAI API key (if the error is due to a missing or
 * invalid key) or to try again (if the error is due to any other reason).
 *
 * If no error has occurred, it displays the upload form.
 */
const Home: React.FC = () => {
	const { uploading, error, analyzeEmail, reset, goToSetApiKey } =
		useMailAnalysis();

	return (
		<div className={styles.homeContainer}>
			{/* If there is an error, show the error message and appropriate action button */}
			{error && (
				<div className={styles.errorBox}>
					<h2>Error</h2>
					<p>{error}</p>
					{/* Show Set OpenAI Key button for API key errors, otherwise show Try Again */}
					{error === ErrorMessages.FREE_TRIAL_EXPIRED ||
					error === ErrorMessages.INVALID_API_KEY ? (
						<button
							className={styles.apiKeyButton}
							onClick={goToSetApiKey}
							type="button"
						>
							Set OpenAI Key
						</button>
					) : (
						<button className={styles.backButton} onClick={reset} type="button">
							Try Again
						</button>
					)}
				</div>
			)}
			{/* If there is no error, show the upload form for email analysis */}
			{!error && (
				<UploadForm isUploading={uploading} onAnalyze={analyzeEmail} />
			)}
		</div>
	);
};

export default Home;
