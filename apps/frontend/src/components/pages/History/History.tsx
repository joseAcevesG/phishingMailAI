import { useNavigate } from "react-router-dom";
import type { History } from "../../../types";
import styles from "./History.module.css";
import { useFetch } from "../../../hooks/useFetch";

const HistoryPage: React.FC = () => {
	const navigate = useNavigate();
	const { data: history, error, loading } = useFetch<History[]>({ url: "/api/analyze-mail" });

	if (loading) return <div>Loading history...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!history || history.length === 0) return <div>No history found.</div>;

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
