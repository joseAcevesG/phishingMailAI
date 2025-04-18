import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ResultView } from "../../components/ResultView/ResultView";
import type { Analysis } from "@shared/types";

const Analyze = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [analysis, setAnalysis] = useState<Analysis | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch(`/api/analyze-mail/${id}`)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Failed to fetch analysis (status ${res.status})`);
				}
				return res.json();
			})
			.then((data: Analysis) => setAnalysis(data))
			.catch((err: Error) => setError(err.message))
			.finally(() => setLoading(false));
	}, [id]);

	if (loading) return <div>Loading analysis...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!analysis) return <div>No analysis found.</div>;

	return <ResultView result={analysis} onReset={() => navigate("/")} />;
};

export default Analyze;
