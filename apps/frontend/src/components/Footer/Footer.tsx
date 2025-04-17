import styles from "./Footer.module.css";

const Footer: React.FC = () => {
	return (
		<footer className={styles.footer}>
			<div className={styles.footerContent}>
				<span>
					© {new Date().getFullYear()} PhishingMail AI. All rights reserved.
				</span>
			</div>
		</footer>
	);
};

export default Footer;
