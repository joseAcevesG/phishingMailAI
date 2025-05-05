import styles from "./Footer.module.css";

/**
 * Footer component that displays the current year and a copyright notice.
 */
const Footer: React.FC = () => {
	return (
		<footer className={styles.footer}>
			<p>© {new Date().getFullYear()} PhishingMail AI. All rights reserved.</p>
		</footer>
	);
};

export default Footer;
