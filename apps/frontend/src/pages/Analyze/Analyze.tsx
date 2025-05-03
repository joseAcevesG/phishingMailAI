import { useAnalyze } from "./useAnalyze";
import { ResultView } from "./ResultView";

const Analyze: React.FC = () => {
	const { analysis, error, loading, navigate } = useAnalyze();

	if (loading) return <div>Loading analysis...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!analysis) return <div>No analysis found.</div>;

	return <ResultView onReset={() => navigate("/")} result={analysis} />;
};

export default Analyze;
