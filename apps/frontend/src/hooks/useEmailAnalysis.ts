import type { Analysis } from "@shared/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessages from "../types/error-messages";

export const useEmailAnalysis = () => {
	const [uploading, setUploading] = useState(false);
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
					if (errorData.includes("Invalid OpenAI API key")) {
						setError(ErrorMessages.INVALID_API_KEY);
						return;
					}
				}
				const errorData = await response
					.json()
					.catch(() => ({ message: ErrorMessages.FAILED_ANALYSIS }));
				throw new Error(errorData.message || ErrorMessages.FAILED_ANALYSIS);
			}

			const result: Analysis = await response.json();

			// redirect to analysis page
			navigate(`/analyze/${result._id}`);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : ErrorMessages.GENERIC_ERROR,
			);
		} finally {
			setUploading(false);
		}
	};

	const reset = () => {
		setError(null);
	};

	const goToSetApiKey = () => {
		navigate("/settings");
	};

	return {
		uploading,
		error,
		analyzeEmail,
		reset,
		goToSetApiKey,
	};
};
