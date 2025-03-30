import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessages from "../types/error-messages";
import type { AnalysisResult } from "../types/api";

export const useEmailAnalysis = () => {
	const [uploading, setUploading] = useState(false);
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const analyzeEmail = async (file: File) => {
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
				if (response.status === 403) {
					setError(ErrorMessages.FREE_TRIAL_EXPIRED);
					return;
				}
				if (response.status === 400) {
					const errorData = await response.text();
					if (errorData.includes('Invalid OpenAI API key')) {
						setError(ErrorMessages.INVALID_API_KEY);
						return;
					}
				}
				const errorData = await response
					.json()
					.catch(() => ({ message: ErrorMessages.FAILED_ANALYSIS }));
				throw new Error(errorData.message || ErrorMessages.FAILED_ANALYSIS);
			}

			const result: AnalysisResult = await response.json();
			setResult(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : ErrorMessages.GENERIC_ERROR);
		} finally {
			setUploading(false);
		}
	};

	const reset = () => {
		setResult(null);
		setError(null);
	};

	const goToSetApiKey = () => {
		navigate("/set-api-key");
	};

	return {
		uploading,
		result,
		error,
		analyzeEmail,
		reset,
		goToSetApiKey,
	};
};
