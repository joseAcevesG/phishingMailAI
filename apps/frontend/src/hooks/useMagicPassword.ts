import { useEffect, useState } from "react";
import ErrorMessages from "../types/error-messages";

/**
 * Custom hook to handle resend cooldown logic for buttons.
 * @param initialCountdown The initial countdown value in seconds (default: 15)
 * @returns Object with email, setEmail, isButtonDisabled, setIsButtonDisabled, countdown, error, setError
 */
export function useMagicPassword(initialCountdown = 15) {
	const [email, setEmail] = useState("");
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [countdown, setCountdown] = useState(initialCountdown);
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
			setCountdown(initialCountdown);
		}

		return () => {
			if (timer) clearInterval(timer);
		};
	}, [isButtonDisabled, countdown, initialCountdown]);

	const handleMagicLinkRequest = async () => {
		if (!email) {
			setError("Please enter your email address");
			return;
		}

		const controller = new AbortController();
		try {
			setError(null);
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ type: "magic_links", email }),
				credentials: "include",
			});

			if (!response.ok) {
				if (response.status >= 500) {
					throw new Error(ErrorMessages.GENERIC_ERROR);
				}
				const errorData = await response.json();
				throw new Error(errorData.message || ErrorMessages.FAILED_TO_LOGIN);
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
					: "An error occurred while logging in",
			);
		} finally {
			controller.abort();
		}
	};

	return {
		email,
		setEmail,
		isButtonDisabled,
		countdown,
		error,
		setError,
		handleMagicLinkRequest,
	};
}
