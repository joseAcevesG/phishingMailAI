import type { Analysis } from "@shared/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ResultView } from "../../components/ResultView/ResultView";
import ErrorMessages from "../../types/error-messages";

const Analyze: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [analysis, setAnalysis] = useState<Analysis | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		const fetchAnalysis = async () => {
			try {
				const response = await fetch(`/api/analyze-mail/${id}`, {
					signal: controller.signal,
				});
				if (!response.ok) {
					if (response.status >= 500) {
						throw new Error(ErrorMessages.GENERIC_ERROR);
					}
					const errorData = await response.json();
					throw new Error(
						errorData.message || ErrorMessages.FAILED_TO_FETCH_ANALYSIS
					);
				}
				const data: Analysis = await response.json();
				setAnalysis(data);
			} catch (err: unknown) {
				if (err instanceof DOMException && err.name === "AbortError") {
					// Fetch was aborted, do nothing
					return;
				}
				setError(
					err instanceof Error
						? err.message
						: "An error occurred while fetching analysis"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchAnalysis();

		return () => {
			controller.abort();
		};
	}, [id]);

	if (loading) return <div>Loading analysis...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!analysis) return <div>No analysis found.</div>;

	return <ResultView onReset={() => navigate("/")} result={analysis} />;
};

export default Analyze;
