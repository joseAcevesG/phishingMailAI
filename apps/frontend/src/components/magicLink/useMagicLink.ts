import { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import type { APIMessage } from "../../types";

/**
 * Custom hook to handle magic link resend cooldown logic for buttons.
 * @param initialCountdown The initial countdown value in seconds (default: 15)
 * @param url The URL to send the magic link request to
 * @returns Object with email, setEmail, isButtonDisabled, setIsButtonDisabled, countdown, error, setError
 */
export function useMagicLink({
	initialCountdown = 15,
	url,
}: { initialCountdown?: number; url: string }) {
	const [email, setEmail] = useState("");
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [countdown, setCountdown] = useState(initialCountdown);
	const [error, setError] = useState<string | null>(null);

	const { execute, error: fetchError } = useFetch<APIMessage>(
		{
			url,
			method: "POST",
		},
		false,
	);

	useEffect(() => {
		if (fetchError) setError(fetchError);
	}, [fetchError]);

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

		setError(null);
		const result = await execute({ body: { type: "magic_links", email } });
		if (result) {
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
