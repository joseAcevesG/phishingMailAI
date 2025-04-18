import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { History } from "../../types";
import styles from "./History.module.css";

const HistoryPage = () => {
	const [history, setHistory] = useState<History[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetch("/api/analyze-mail")
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Failed to fetch history (status ${res.status})`);
				}
				return res.json();
			})
			.then((data: History[]) => setHistory(data))
			.catch((err: Error) => setError(err.message))
			.finally(() => setLoading(false));
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
