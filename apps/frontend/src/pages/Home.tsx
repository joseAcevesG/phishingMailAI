import { useEmailAnalysis } from "../hooks/useEmailAnalysis";
import { ResultView } from "../components/ResultView";
import { UploadForm } from "../components/UploadForm";
import "./Home.css";

const Home = () => {
	const {
		uploading,
		result,
		error,
		analyzeEmail,
		reset,
		goToSetApiKey
	} = useEmailAnalysis();

	return (
		<div className="home-container">
			{error && (
				<div className="error-box">
					<h2>Error</h2>
					<p>{error}</p>
					{error === "You are out of free tries" ? (
						<button className="api-key-button" onClick={goToSetApiKey} type="button">
							Set OpenAI Key
						</button>
					) : (
						<button className="back-button" onClick={reset} type="button">
							Try Again
						</button>
					)}
				</div>
			)}
			{!error &&
				(result ? (
					<ResultView onReset={reset} result={result} />
				) : (
					<UploadForm isUploading={uploading} onAnalyze={analyzeEmail} />
				))}
		</div>
	);
};

export default Home;
