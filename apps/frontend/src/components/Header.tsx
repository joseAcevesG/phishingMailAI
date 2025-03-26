import "./Header.css";

interface HeaderProps {
	userEmail?: string;
	onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
	if (!userEmail) return null;

	return (
		<header className="header">
			<div className="header-content">
				<span>Logged in as {userEmail}</span>
				<button type="button" onClick={onLogout} className="logout-button">
					Logout
				</button>
			</div>
		</header>
	);
};
