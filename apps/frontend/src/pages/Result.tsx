import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AnalysisResult } from "../types/api";
import "./Result.css";

export const Result = () => {
	const navigate = useNavigate();
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchResult = async () => {
			try {
				const response = await fetch("/api/analyze-email/result");
				if (!response.ok) {
					throw new Error("Failed to fetch result");
				}
				const data = await response.json();
				setResult(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		};

		fetchResult();
	}, []);

	if (loading) {
		return (
			<div className="result-container">
				<div className="result-box loading">
					<h2>Analyzing email...</h2>
					<div className="loader" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="result-container">
				<div className="result-box error">
					<h2>Error</h2>
					<p>{error}</p>
					<button
						className="back-button"
						onClick={() => navigate("/")}
						type="button"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (!result) {
		return (
			<div className="result-container">
				<div className="result-box error">
					<h2>No Result Found</h2>
					<p>Could not find analysis result. Please try again.</p>
					<button
						className="back-button"
						onClick={() => navigate("/")}
						type="button"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="result-container">
			<div className="result-box">
				<h2>Analysis Result</h2>
				<div className="result-details">
					<p className="probability">
						Probability of being phishing:{" "}
						{(result.probability * 100).toFixed(1)}%
					</p>
					<p className="description">{result.description}</p>
				</div>
				<button
					className="back-button"
					onClick={() => navigate("/")}
					type="button"
				>
					Analyze Another Email
				</button>
			</div>
		</div>
	);
};
