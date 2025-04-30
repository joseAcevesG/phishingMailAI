import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { APIMessage, History } from "../../../types";
import styles from "./History.module.css";
import { useFetch } from "../../../hooks/useFetch";
import TrashIcon from "../../../assets/icons/trash";

const HistoryPage: React.FC = () => {
	const navigate = useNavigate();
	const {
		data: history,
		error,
		loading,
	} = useFetch<History[]>({ url: "/api/analyze-mail" });

	// Local state for optimistic UI
	const [historyList, setHistoryList] = useState<History[] | null>(null);

	// Sync local state when fetched data changes
	useEffect(() => {
		if (history) setHistoryList(history);
	}, [history]);

	const { execute: deleteHistory } = useFetch<APIMessage>(
		{ url: "/api/analyze-mail/:id", method: "DELETE" },
		false
	);

	const handleDelete = async (id: string) => {
		if (!historyList) return;
		// Optimistically remove from UI
		const prevList = historyList;
		setHistoryList(historyList.filter((item) => item._id !== id));
		const result = await deleteHistory({ url: `/api/analyze-mail/${id}` });
		if (!result) {
			setHistoryList(prevList);
		}
	};

	if (loading) return <div>Loading history...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!historyList || historyList.length === 0)
		return <div>No history found.</div>;

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
					{historyList.map((item) => (
						<tr key={item._id}>
							<td>{item.subject}</td>
							<td>{item.from}</td>
							<td>{item.to}</td>
							<td className={styles.actions}>
								<button
									type="button"
									onClick={() => handleDelete(item._id)}
									className={styles.deleteButton}
									aria-label="Delete"
								>
									<TrashIcon />
								</button>
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
