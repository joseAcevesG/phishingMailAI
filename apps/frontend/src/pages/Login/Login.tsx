import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import styles from "./Login.module.css";

interface Props {
	isAuthenticated?: boolean;
}

export const Login: React.FC<Props> = ({ isAuthenticated }) => {
	const [email, setEmail] = useState("");
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [countdown, setCountdown] = useState(15);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (isButtonDisabled && countdown > 0) {
			timer = setInterval(() => {
				setCountdown((prev) => prev - 1);
			}, 1000);
		}

		if (countdown === 0) {
			setIsButtonDisabled(false);
			setCountdown(15);
		}

		return () => {
			if (timer) clearInterval(timer);
		};
	}, [isButtonDisabled, countdown]);

	const handleMagicLinkRequest = async () => {
		if (!email) {
			setError("Please enter your email address");
			return;
		}

		const controller = new AbortController();

		try {
			setError(null);
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to send magic link");
			}

			setIsButtonDisabled(true);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				// Fetch was aborted, do nothing
				return;
			}
			setError(
				err instanceof Error
					? err.message
					: "An error occurred while sending the magic link"
			);
		} finally {
			controller.abort();
		}
	};

	if (isAuthenticated) {
		return <Navigate replace to="/" />;
	}

	return (
		<div id="login" className={styles.loginContainer}>
			<div className={styles.loginBox}>
				<h1>Welcome to Phishing Mail AI</h1>
				<p>Please log in to continue</p>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleMagicLinkRequest();
					}}
				>
					<div className={styles.inputGroup}>
						<input
							className={styles.emailInput}
							onChange={(e) => {
								setEmail(e.target.value);
								setError(null);
							}}
							placeholder="Enter your email"
							type="email"
							value={email}
						/>
					</div>
					{error && <p className={styles.errorMessage}>{error}</p>}
					<button
						className={styles.loginButton}
						disabled={isButtonDisabled}
						type="submit"
					>
						{isButtonDisabled
							? `You can resend a magic link in: ${countdown} seconds`
							: "Login with Magic Link"}
					</button>
				</form>
			</div>
		</div>
	);
};
