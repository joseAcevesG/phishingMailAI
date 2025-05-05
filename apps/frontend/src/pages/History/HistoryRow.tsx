import TrashIcon from "../../assets/icons/trash";
import styles from "./History.module.css";

interface Props {
	item: {
		_id: string;
		subject: string;
		from: string;
		to: string;
	};
	handleDelete: (id: string) => void;
	navigate: (path: string) => void;
}

/**
 * A single row in the history table.
 *
 * @param item - The analysis item to render.
 * @param handleDelete - A function to call when the delete button is clicked.
 * @param navigate - A function to call when the view button is clicked.
 *
 * The row displays the subject, from, and to of the analysis item. It also
 * contains two buttons: a delete button and a view button. When the delete
 * button is clicked, it calls the handleDelete function with the id of the
 * analysis item. When the view button is clicked, it calls the navigate
 * function with the path /analyze/{id}, where {id} is the id of the analysis
 * item.
 */
const HistoryRow: React.FC<Props> = ({ item, handleDelete, navigate }) => (
	<tr key={item._id}>
		<td>{item.subject}</td>
		<td>{item.from}</td>
		<td>{item.to}</td>
		<td className={styles.actions}>
			<button
				aria-label="Delete"
				className={styles.deleteButton}
				onClick={() => handleDelete(item._id)}
				type="button"
			>
				<TrashIcon />
			</button>
			<button onClick={() => navigate(`/analyze/${item._id}`)} type="button">
				View
			</button>
		</td>
	</tr>
);

export default HistoryRow;
