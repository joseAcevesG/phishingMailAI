"use client";

import { Link } from "react-router-dom";
import styles from "./Landing.module.css";

/**
 * The landing page component, shown when the user is not authenticated.
 *
 * Redirects the user to the home page if they are already authenticated.
 *
 * @returns The landing page React component.
 */

const Landing: React.FC = () => {
	return (
		<div className={styles.landingContainer}>
			<div className={styles.landingContent}>
				{/* Title and introduction for new users */}
				<h1>Welcome to PhishingMail AI</h1>
				<p>
					Secure your inbox with AI-powered phishing detection. Our advanced
					GPT-4o technology identifies sophisticated attacks that traditional
					filters miss. Upload .eml files for instant analysis and get detailed
					security reports.
					<br />
					<br />
					<strong>Start today with 10 free scans!</strong>
				</p>
				{/* Get Started button navigates to the login page */}
				<Link className={styles.getStartedBtn} to="/login">
					Get Started
				</Link>
			</div>
		</div>
	);
};

export default Landing;
