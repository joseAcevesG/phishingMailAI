"use client";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./Landing.module.css";

export const Landing = () => {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	const handleGetStarted = () => {
		navigate("/login");
	};

	if (isAuthenticated) {
		navigate("/");
		return null;
	}

	return (
		<div className={styles.landingContainer}>
			<div className={styles.landingContent}>
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
				<button
					type="button"
					className={styles.getStartedBtn}
					onClick={handleGetStarted}
				>
					Get Started
				</button>
			</div>
		</div>
	);
};
