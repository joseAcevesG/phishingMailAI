import { Navigate } from "react-router-dom";
import type { LoginProps } from "../types/components";
import "./Login.css";

export const Login: React.FC<LoginProps> = ({ isAuthenticated, onLogin }) => {
	if (isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return (
		<div className="login-container">
			<div className="login-box">
				<h1>Welcome to Phishing Mail AI</h1>
				<p>Please log in to continue</p>
				<button type="button" onClick={onLogin} className="login-button">
					Login with Magic Link
				</button>
			</div>
		</div>
	);
};
