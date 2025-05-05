import { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import type { APIMessage, History } from "../../types";

/**
 * Custom hook to manage the history list of analyzed emails.
 *
 * This hook fetches and returns a list of analyzed emails, along with loading and error states.
 * It also provides a function to delete an email from the history list.
 *
 * @returns {Object} An object containing:
 *  - `historyList`: The list of analyzed emails or `null` if not available.
 *  - `setHistoryList`: Function to manually set the history list.
 *  - `loading`: Boolean indicating if the history data is currently being fetched.
 *  - `error`: Error message if fetching fails, otherwise `null`.
 *  - `handleDelete`: Function to delete an email from the history list by its ID.
 */
export function useHistoryList() {
	const {
		data: history,
		error,
		loading,
	} = useFetch<History[]>({ url: "/api/analyze-mail" });

	// Local state to store the history list
	const [historyList, setHistoryList] = useState<History[] | null>(null);

	// Update local historyList state when fetched history changes
	useEffect(() => {
		if (history) setHistoryList(history);
	}, [history]);

	// Hook to call the delete endpoint for a specific analysis
	const { execute: deleteHistory } = useFetch<APIMessage>(
		{ url: "/api/analyze-mail/:id", method: "DELETE" },
		false,
	);

	// Function to delete an item from the history list by ID
	// Optimistically removes the item from the UI, then restores it if the API call fails
	const handleDelete = async (id: string) => {
		if (!historyList) return;
		const prevList = historyList;
		setHistoryList(historyList.filter((item) => item._id !== id));
		const result = await deleteHistory({ url: `/api/analyze-mail/${id}` });
		if (!result) {
			setHistoryList(prevList);
		}
	};

	// Return the state and handlers for use in components
	return {
		historyList,
		setHistoryList,
		loading,
		error,
		handleDelete,
	};
}
