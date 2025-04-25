import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Analysis } from "shared";
import ErrorMessages from "../types/error-messages";

export const useEmailAnalysis = () => {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const analyzeEmail = async (file: File) => {
		setUploading(true);
		setError(null);

		const controller = new AbortController();
		try {
			const formData = new FormData();
			formData.append("emlFile", file);

			const response = await fetch("/api/analyze-mail/validate", {
				method: "POST",
				body: formData,
				signal: controller.signal,
			});

			if (!response.ok) {
				if (response.status >= 500) {
					setError(ErrorMessages.GENERIC_ERROR);
					return;
				}
				const errorData = await response.json();
				throw new Error(errorData.message || ErrorMessages.FAILED_ANALYSIS);
			}

			const result: Analysis = await response.json();

			// redirect to analysis page
			navigate(`/analyze/${result._id}`);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				// Fetch was aborted, do nothing
				return;
			}
			setError(
				err instanceof Error ? err.message : ErrorMessages.GENERIC_ERROR,
			);
		} finally {
			setUploading(false);
			controller.abort();
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
