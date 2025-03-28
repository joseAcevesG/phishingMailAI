import type { AnalysisResult } from "../types/api";
import "./ResultView.css";

interface Props {
	result: AnalysisResult;
	onReset: () => void;
}

export const ResultView = ({ result, onReset }: Props) => {
	return (
		<div className="result-box">
			<h2>Analysis Result</h2>
			<div className="result-details">
				<p className="probability">
					Probability of being phishing:&nbsp;
					{(result.phishingProbability * 100).toFixed(1)}%
				</p>
				<p className="description">{result.reasons}</p>
				{result.redFlags.length > 0 && (
					<div className="red-flags">
						<h3>Red Flags:</h3>
						<ul>
							{result.redFlags.map((flag) => (
								<li key={flag}>{flag}</li>
							))}
						</ul>
					</div>
				)}
			</div>
			<button className="back-button" onClick={onReset} type="button">
				Analyze Another Email
			</button>
		</div>
	);
};
