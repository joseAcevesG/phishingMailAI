import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { LoginProps } from "../types/components";
import "./Login.css";

export const Login: React.FC<LoginProps> = ({ isAuthenticated }) => {
	const [email, setEmail] = useState("");
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [countdown, setCountdown] = useState(15);

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
			alert("Please enter your email address");
			return;
		}

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
				credentials: "include",
			});

			if (response.ok) {
				setIsButtonDisabled(true);
				alert("Magic link has been sent to your email!");
			} else {
				const error = await response.json();
				alert(error.message || "Failed to send magic link");
			}
		} catch (error) {
			console.error("Error:", error);
			alert("An error occurred while sending the magic link");
		}
	};

	if (isAuthenticated) {
		return <Navigate replace to="/" />;
	}

	return (
		<div className="login-container">
			<div className="login-box">
				<h1>Welcome to Phishing Mail AI</h1>
				<p>Please log in to continue</p>
				<div className="input-group">
					<input
						className="email-input"
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email"
						type="email"
						value={email}
					/>
				</div>
				<button
					className="login-button"
					disabled={isButtonDisabled}
					onClick={handleMagicLinkRequest}
					type="button"
				>
					{isButtonDisabled
						? `You can resend a magic link in: ${countdown} seconds`
						: "Login with Magic Link"}
				</button>
			</div>
		</div>
	);
};
