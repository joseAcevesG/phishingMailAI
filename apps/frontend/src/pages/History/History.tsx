import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { History } from "../../types";
import styles from "./History.module.css";
import ErrorMessages from "../../types/error-messages";

const HistoryPage: React.FC = () => {
	const [history, setHistory] = useState<History[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const controller = new AbortController();
		const fetchHistory = async () => {
			try {
				const response = await fetch("/api/analyze-mail", {
					signal: controller.signal,
				});
				if (!response.ok) {
					if (response.status >= 500) {
						throw new Error(ErrorMessages.GENERIC_ERROR);
					}
					const errorData = await response.json();
					throw new Error(
						errorData.message || ErrorMessages.FAILED_TO_FETCH_HISTORY
					);
				}
				const data: History[] = await response.json();
				setHistory(data);
			} catch (err) {
				if (err instanceof DOMException && err.name === "AbortError") {
					return;
				}
				setError(
					err instanceof Error
						? err.message
						: "An error occurred while fetching history"
				);
			} finally {
				setLoading(false);
			}
		};
		fetchHistory();
		return () => controller.abort();
	}, []);

	if (loading) return <div>Loading history...</div>;
	if (error) return <div>Error: {error}</div>;
	if (history.length === 0) return <div>No history found.</div>;

	return (
		<div className={styles.container}>
			<h1>History</h1>
			<table className={styles.table}>
				<thead>
					<tr>
						<th>Subject</th>
						<th>From</th>
						<th>To</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{history.map((item) => (
						<tr key={item._id}>
							<td>{item.subject}</td>
							<td>{item.from}</td>
							<td>{item.to}</td>
							<td>
								<button
									onClick={() => navigate(`/analyze/${item._id}`)}
									type="button"
								>
									View
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default HistoryPage;
