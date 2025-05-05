import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Analysis } from "shared";
import { useFetch } from "../../hooks/useFetch";

/**
 * Custom hook for analyzing email files.
 *
 * This hook provides functionality to upload and analyze .eml files, handle errors,
 * and navigate to different parts of the application based on the analysis result.
 *
 * @returns {Object} An object containing:
 *  - `uploading`: Boolean indicating if the file is currently being uploaded.
 *  - `error`: Error message if the analysis fails, otherwise `null`.
 *  - `analyzeEmail`: Function to upload and analyze an email file.
 *  - `reset`: Function to reset any existing errors.
 *  - `goToSetApiKey`: Function to navigate to the API key settings page.
 */
export const useMailAnalysis = () => {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const {
		execute,
		error: errorFetch,
		loading: uploading,
	} = useFetch<Analysis>(
		{ url: "/api/analyze-mail/validate", method: "POST" },
		false,
	);

	// Update local error state whenever the fetch hook reports an error
	useEffect(() => {
		if (errorFetch) setError(errorFetch);
	}, [errorFetch]);

	/**
	 * Handles the email analysis process.
	 * - Wraps the selected file in FormData and sends it to the backend.
	 * - Navigates to the analysis result page if successful.
	 */
	const analyzeEmail = async (file: File) => {
		const formData = new FormData();
		formData.append("emlFile", file);
		const result = await execute({ body: formData });
		if (result) {
			navigate(`/analyze/${result._id}`);
		}
	};

	/**
	 * Resets the error state if an error exists.
	 */
	const reset = () => {
		error && setError(null);
	};

	/**
	 * Navigates the user to the API key settings page.
	 */
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
