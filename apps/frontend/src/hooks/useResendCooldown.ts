import { useEffect, useState } from "react";

/**
 * Custom hook to handle resend cooldown logic for buttons.
 * @param initialCountdown The initial countdown value in seconds (default: 15)
 * @returns Object with email, setEmail, isButtonDisabled, setIsButtonDisabled, countdown, error, setError
 */
export function useResendCooldown(initialCountdown = 15) {
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
		} catch (err: unknown) {
			if (err instanceof DOMException && err.name === "AbortError") {
				// Fetch was aborted, do nothing
				return;
			}
			setError(
				err instanceof Error
					? err.message
					: "An error occurred while sending the magic link",
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
