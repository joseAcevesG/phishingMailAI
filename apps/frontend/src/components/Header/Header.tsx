import { Link } from "react-router-dom";
import styles from "./Header.module.css";

interface Props {
	userEmail: string | null;
	onLogout: () => void;
}

export const Header: React.FC<Props> = ({ userEmail, onLogout }) => {
	return (
		<header className={styles.header}>
			<div className={styles.logo}>
				<img alt="PhishingMail AI Logo" src="/logo.png" />
				<span className={styles.appName}>PhishingMail AI</span>
			</div>
			<nav className={styles.mainNav}>
				<ul>
					{userEmail ? (
						<>
							<li>
								<Link to="/">Home</Link>
							</li>
							<li>
								<Link to="/settings">Settings</Link>
							</li>
							<li>
								<Link to="/history">History</Link>
							</li>
						</>
					) : (
						<>
							<li>
								<Link to="/">Landing Page</Link>
							</li>
							<li>
								<Link to="/login">Login</Link>
							</li>
							<li>
								<Link to="/signup">Sign Up</Link>
							</li>
						</>
					)}
				</ul>
			</nav>
			{userEmail ? (
				<div className={styles.userInfo}>
					<span>Logged in as {userEmail}</span>
					<button
						className={styles.logoutButton}
						onClick={onLogout}
						type="button"
					>
						Logout
					</button>
				</div>
			) : (
				<div className={styles.userInfoPlaceholder} aria-hidden="true" />
			)}
		</header>
	);
};
