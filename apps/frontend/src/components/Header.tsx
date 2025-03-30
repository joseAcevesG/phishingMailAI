import "./Header.css";
import { useNavigate } from "react-router-dom";

interface Props {
	userEmail: string | null;
	onLogout: () => void;
}

export const Header: React.FC<Props> = ({ userEmail, onLogout }) => {
	const navigate = useNavigate();

	return (
		<header className="header">
			<div className="header-content">
				<div className="user-info">
					{userEmail && <span>Logged in as {userEmail}</span>}
				</div>
				{userEmail ? (
					<div className="header-buttons">
						<button
							className="api-key-button"
							onClick={() => navigate("/set-api-key")}
							type="button"
						>
							Set API Key
						</button>
						<button className="logout-button" onClick={onLogout} type="button">
							Logout
						</button>
					</div>
				) : (
					<button
						className="login-button-nav"
						onClick={() => navigate("/login")}
						type="button"
					>
						Login
					</button>
				)}
			</div>
		</header>
	);
};
