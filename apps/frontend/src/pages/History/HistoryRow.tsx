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
