import { useNavigate } from "react-router-dom";
import styles from "./History.module.css";
import HistoryRow from "./HistoryRow";
import { useHistoryList } from "./useHistoryList";

const HistoryPage = () => {
	const navigate = useNavigate();
	const { historyList, loading, error, handleDelete } = useHistoryList();

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
						<HistoryRow
							handleDelete={handleDelete}
							item={item}
							key={item._id}
							navigate={navigate}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default HistoryPage;
