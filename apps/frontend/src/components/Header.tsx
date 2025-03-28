import "./Header.css";
import { useNavigate } from "react-router-dom";
import type { HeaderProps } from "../types/components";

export const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
	const navigate = useNavigate();

	return (
		<header className="header">
			<div className="header-content">
				<div className="user-info">
					{userEmail && <span>Logged in as {userEmail}</span>}
				</div>
				{userEmail ? (
					<button className="logout-button" onClick={onLogout} type="button">
						Logout
					</button>
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
