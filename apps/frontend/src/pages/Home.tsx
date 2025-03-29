import { useState } from "react";
import { ResultView } from "../components/ResultView";
import { UploadForm } from "../components/UploadForm";
import type { AnalysisResult } from "../types/api";
import "./Home.css";

const Home = () => {
	const [uploading, setUploading] = useState(false);
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleAnalyze = async (file: File) => {
		setUploading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("emlFile", file);

			const response = await fetch("/api/analyze-mail/validate", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ message: "Failed to analyze email" }));
				throw new Error(errorData.message || "Failed to analyze email");
			}

			const result: AnalysisResult = await response.json();
			setResult(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			// throw err;
		} finally {
			setUploading(false);
		}
	};

	const handleReset = () => {
		setResult(null);
		setError(null);
	};

	return (
		<div className="home-container">
			{error && (
				<div className="error-box">
					<h2>Error</h2>
					<p>{error}</p>
					<button className="back-button" onClick={handleReset} type="button">
						Try Again
					</button>
				</div>
			)}
			{!error &&
				(result ? (
					<ResultView onReset={handleReset} result={result} />
				) : (
					<UploadForm isUploading={uploading} onAnalyze={handleAnalyze} />
				))}
		</div>
	);
};

export default Home;
