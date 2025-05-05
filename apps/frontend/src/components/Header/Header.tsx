import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export interface Props {
	userEmail: string | null;
	onLogout: () => void;
}

/**
 * Renders the main header component.
 *
 * It contains a logo, a navigation with links to Home, History, Settings,
 * Login, and Sign Up (depending on whether a user is logged in or not).
 * If a user is logged in, it also displays the email address and a
 * Logout button.
 *
 * @param {{ userEmail: string | null, onLogout: () => void }} props
 * @returns {ReactElement}
 */
export const Header: React.FC<Props> = ({ userEmail, onLogout }) => {
	return (
		<header className={styles.header}>
			{/* The logo of the application */}
			<div className={styles.logo}>
				<img alt="PhishingMail AI Logo" src="/logo.png" />
				<span className={styles.appName}>PhishingMail AI</span>
			</div>

			{/* Navigation bar */}
			<nav className={styles.mainNav}>
				<ul>
					{userEmail ? (
						// If the user is logged in, show home, history, and settings links
						<>
							<li>
								<Link to="/">Home</Link>
							</li>
							<li>
								<Link to="/history">History</Link>
							</li>
							<li>
								<Link to="/settings">Settings</Link>
							</li>
						</>
					) : (
						// If the user is not logged in, show landing page, login, and sign up links
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

			{/* Info about the logged in user */}
			{userEmail ? (
				<div className={styles.userInfo}>
					{/* Show the email address */}
					<span>Logged in as {userEmail}</span>
					{/* Show a logout button */}
					<button
						className={styles.logoutButton}
						onClick={onLogout}
						type="button"
					>
						Logout
					</button>
				</div>
			) : (
				// If the user is not logged in, show a placeholder for the user info
				<div aria-hidden="true" className={styles.userInfoPlaceholder} />
			)}
		</header>
	);
};
