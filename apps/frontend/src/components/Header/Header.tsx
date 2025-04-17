import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

interface Props {
	userEmail: string | null;
	onLogout: () => void;
}

export const Header: React.FC<Props> = ({ userEmail, onLogout }) => {
	const navigate = useNavigate();

	return (
		<header className={styles.header}>
			<div className={styles.headerContent}>
				<div className={styles.userInfo}>
					{userEmail && <span>Logged in as {userEmail}</span>}
				</div>
				{userEmail ? (
					<div className={styles.headerButtons}>
						<button
							type="button"
							className={styles.apiKeyButton}
							onClick={() => navigate("/set-api-key")}
						>
							API Key
						</button>
						<button
							type="button"
							className={styles.homeButton}
							onClick={() => navigate("/")}
						>
							Home
						</button>
						<button
							type="button"
							className={styles.logoutButton}
							onClick={onLogout}
						>
							Logout
						</button>
					</div>
				) : (
					<div className={styles.headerButtons}>
						<button
							type="button"
							className={styles.homeButton}
							onClick={() => navigate("/")}
						>
							Landing Page
						</button>
						<button
							type="button"
							className={styles.loginButton}
							onClick={() => navigate("/login")}
						>
							Login
						</button>
					</div>
				)}
			</div>
		</header>
	);
};
