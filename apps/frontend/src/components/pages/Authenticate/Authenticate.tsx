import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Authenticate.module.css";
import type { APIAuth } from "../../../types";
import { useFetch } from "../../../hooks/useFetch";

interface Props {
	onAuthenticate: (data: APIAuth) => void;
}

export const Authenticate: React.FC<Props> = ({ onAuthenticate }) => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { execute } = useFetch<APIAuth>(
		{ url: "/api/auth/authenticate", method: "POST" },
		false
	);

	useEffect(() => {
		const queryString = searchParams.toString();

		if (!queryString) {
			navigate("/login");
			return;
		}

		execute({ url: `/api/auth/authenticate?${queryString}` }).then((result) => {
			if (result) {
				onAuthenticate(result);
			} else {
				navigate("/login");
			}
		});
	}, [execute, navigate, onAuthenticate, searchParams]);

	return (
		<div className={styles.authenticateContainer}>
			<p>Authenticating...</p>
		</div>
	);
};
