import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
					setError("You are out of free tries");
					return;
				}
				const errorData = await response
					.json()
					.catch(() => ({ message: "Failed to analyze email" }));
				throw new Error(errorData.message || "Failed to analyze email");
			}

			const result: AnalysisResult = await response.json();
			setResult(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
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
