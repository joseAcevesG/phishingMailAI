import { useNavigate } from "react-router-dom";
import styles from "./History.module.css";
import HistoryRow from "./HistoryRow";
import { useHistoryList } from "./useHistoryList";

/**
 * The HistoryPage component renders a page that displays the user's history.
 *
 * The page will display a table with the columns "Subject", "From", "To", and
 * "Action". The rows of the table will contain the subject, from, to, and a
 * button to delete the analysis for each of the user's analysis. The button
 * will call the `handleDelete` function when clicked, which will delete the
 * analysis and remove it from the table.
 *
 * The page will also display a message if the user has no history.
 *
 * @returns A React component that renders the user's history.
 */
const HistoryPage = () => {
	const navigate = useNavigate();
	const { historyList, loading, error, handleDelete } = useHistoryList();

	if (loading) return <div>Loading history...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!historyList || historyList.length === 0)
		return <div>No history found.</div>;

	// Render the history table if data is available
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
					{/* Render a row for each history item */}
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
