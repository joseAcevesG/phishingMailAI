import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Authenticate.module.css";

interface Props {
	onAuthenticate: (data: { authenticated: boolean; email: string }) => void;
}

export const Authenticate: React.FC<Props> = ({ onAuthenticate }) => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const controller = new AbortController();
		const authenticateUser = async () => {
			const queryString = searchParams.toString();

			if (!queryString) {
				navigate("/login");
				return;
			}

			try {
				const response = await fetch(`/api/auth/authenticate?${queryString}`, {
					signal: controller.signal,
				});
				if (response.ok) {
					onAuthenticate(await response.json());
				} else {
					// If authentication fails, redirect to login
					navigate("/login");
				}
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					// Fetch was aborted, do nothing
					return;
				}
				navigate("/login");
			}
		};

		authenticateUser();

		return () => controller.abort();
	}, [navigate, searchParams, onAuthenticate]);

	return (
		<div className={styles.authenticateContainer}>
			<p>Authenticating...</p>
		</div>
	);
};
