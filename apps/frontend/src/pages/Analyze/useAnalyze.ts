import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Analysis } from "shared";
import { useFetch } from "../../hooks/useFetch";

/**
 * Custom hook to fetch and return analysis data for a specific email.
 *
 * This hook uses URL parameters to extract an `id`, which is then used to fetch
 * the corresponding analysis data from the `/api/analyze-mail/${id}` endpoint.
 * It returns the analysis data, any error encountered during the fetch, the loading
 * state, and a navigate function for routing.
 *
 * @returns {Object} An object containing:
 *  - `analysis`: The fetched analysis data or `null` if not available.
 *  - `error`: Error message if fetching fails, otherwise `null`.
 *  - `loading`: Boolean indicating if the data is currently being fetched.
 *  - `navigate`: Function to navigate programmatically.
 */
export function useAnalyze() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	// Use the useFetch hook to fetch the analysis data
	const {
		data: analysis,
		error,
		loading,
		execute,
	} = useFetch<Analysis>({ url: `/api/analyze-mail/${id}` }, false);

	// Call execute on mount
	useEffect(() => {
		execute();
	}, [execute]);

	return { analysis, error, loading, navigate };
}
