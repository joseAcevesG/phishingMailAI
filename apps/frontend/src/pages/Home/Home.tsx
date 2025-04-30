import { UploadForm } from "./UploadForm";
import { useMailAnalysis } from "./useMailAnalysis";
import ErrorMessages from "../../types/error-messages";
import styles from "./Home.module.css";

const Home: React.FC = () => {
	const { uploading, error, analyzeEmail, reset, goToSetApiKey } =
		useMailAnalysis();

	return (
		<div className={styles.homeContainer}>
			{error && (
				<div className={styles.errorBox}>
					<h2>Error</h2>
					<p>{error}</p>
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
			{!error && (
				<UploadForm isUploading={uploading} onAnalyze={analyzeEmail} />
			)}
		</div>
	);
};

export default Home;
