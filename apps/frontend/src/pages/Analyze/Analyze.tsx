import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Analysis } from "shared";
import { useFetch } from "../../hooks/useFetch";
import { ResultView } from "./ResultView";

const Analyze: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const {
		data: analysis,
		error,
		loading,
		execute,
	} = useFetch<Analysis>({ url: `/api/analyze-mail/${id}` }, false);

	useEffect(() => {
		execute();
	}, [execute]);

	if (loading) return <div>Loading analysis...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!analysis) return <div>No analysis found.</div>;

	return <ResultView onReset={() => navigate("/")} result={analysis} />;
};

export default Analyze;
