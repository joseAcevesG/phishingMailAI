import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Props {
	onAuthenticate: (data: { authenticated: boolean; email: string }) => void;
}

export const Authenticate: React.FC<Props> = ({ onAuthenticate }) => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const authenticateUser = async () => {
			const queryString = searchParams.toString();

			if (!queryString) {
				console.error("No query parameters provided");
				navigate("/login");
				return;
			}

			try {
				const response = await fetch(`/api/auth/authenticate?${queryString}`, {
					credentials: "include",
				});
				if (response.ok) {
					onAuthenticate(await response.json());
				} else {
					// If authentication fails, redirect to login
					console.error("Authentication failed");
					alert("Authentication failed, please try again");
					navigate("/login");
				}
			} catch (error) {
				console.error("Authentication error:", error);
				navigate("/login");
			}
		};

		authenticateUser();
	}, [navigate, searchParams, onAuthenticate]);

	return (
		<div className="authenticate-container">
			<p>Authenticating...</p>
		</div>
	);
};
