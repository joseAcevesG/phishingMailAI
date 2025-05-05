import { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import type { APIMessage } from "../../types";

/**
 * React hook to handle magic link authentication.
 *
 * @param {Object} options
 * @param {number} [options.initialCountdown=15] - Initial countdown value in seconds.
 * @param {string} options.url - URL to send the magic link request to.
 * @returns {
 *   email: string;
 *   setEmail: (email: string) => void;
 *   isButtonDisabled: boolean;
 *   countdown: number;
 *   error: string | null;
 *   setError: (error: string | null) => void;
 *   handleMagicLinkRequest: () => Promise<void>;
 * }
 */
export function useMagicLink({
	initialCountdown = 15,
	url,
}: { initialCountdown?: number; url: string }) {
	const [email, setEmail] = useState("");
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [countdown, setCountdown] = useState(initialCountdown);
	const [error, setError] = useState<string | null>(null);

	// Fetch hook to send magic link request to the backend
	const { execute, error: fetchError } = useFetch<APIMessage>(
		{
			url,
			method: "POST",
		},
		false,
	);

	// Error handling for fetch error
	useEffect(() => {
		if (fetchError) setError(fetchError);
	}, [fetchError]);

	// Countdown timer and button state management
	useEffect(() => {
		let timer: NodeJS.Timeout;
		// Enable countdown timer when button is disabled
		if (isButtonDisabled && countdown > 0) {
			timer = setInterval(() => {
				setCountdown((prev) => prev - 1);
			}, 1000);
		}

		// Reset the countdown and button state when the countdown reaches 0
		if (countdown === 0) {
			setIsButtonDisabled(false);
			setCountdown(initialCountdown);
		}

		// Clean up the timer on component unmount
		return () => {
			if (timer) clearInterval(timer);
		};
	}, [isButtonDisabled, countdown, initialCountdown]);

	const handleMagicLinkRequest = async () => {
		if (!email) {
			// Show error message if the user doesn't enter an email
			setError("Please enter your email address");
			return;
		}

		setError(null);
		const result = await execute({ body: { type: "magic_links", email } });
		if (result) {
			// Disable the button and start the countdown after a successful request
			setIsButtonDisabled(true);
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

export type UseMagicLinkReturn = ReturnType<typeof useMagicLink>;
