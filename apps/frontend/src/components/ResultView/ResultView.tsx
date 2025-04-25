import type { Analysis } from "shared";
import styles from "./ResultView.module.css";

interface Props {
	result: Analysis;
	onReset: () => void;
}

export const ResultView: React.FC<Props> = ({ result, onReset }) => {
	return (
		<div className={styles.resultBox}>
			<h2>Analysis Result</h2>
			<div className={styles.resultDetails}>
				<p>Subject: {result.subject}</p>
				<p>From: {result.from}</p>
				<p>To: {result.to}</p>
				<p className={styles.probability}>
					Probability of being phishing:&nbsp;
					{(result.phishingProbability * 100).toFixed(1)}%
				</p>
				<p className={styles.description}>{result.reasons}</p>
				{result.redFlags.length > 0 && (
					<div className={styles.redFlags}>
						<h3>Red Flags:</h3>
						<ul>
							{result.redFlags.map((flag) => (
								<li key={flag}>{flag}</li>
							))}
						</ul>
					</div>
				)}
			</div>
			<button className={styles.backButton} onClick={onReset} type="button">
				Analyze Another Email
			</button>
		</div>
	);
};
