import ResultView from "./ResultView";
import { useAnalyze } from "./useAnalyze";

/**
 * Analyze component.
 *
 * Uses the useAnalyze hook to load an analysis object and error state.
 * If loading, shows a "Loading analysis..." message.
 * If error, shows an "Error: <error>" message.
 * If analysis is present, renders a ResultView with the analysis object and a reset function.
 */
const Analyze: React.FC = () => {
	// Use the useAnalyze hook to load an analysis object and error state.
	const { analysis, error, loading, navigate } = useAnalyze();

	if (loading) return <div>Loading analysis...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!analysis) return <div>No analysis found.</div>;

	return <ResultView onReset={() => navigate("/")} result={analysis} />;
};

export default Analyze;
