import { useParams } from "react-router-dom";

export default function IdPage() {
	const { id } = useParams();

	return (
		<div className="id-container">
			<h1>ID Page</h1>
			<p>
				The current ID is: <strong>{id}</strong>
			</p>
		</div>
	);
}
