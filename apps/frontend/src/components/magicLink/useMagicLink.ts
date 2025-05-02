import { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import type { APIMessage } from "../../types";

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

export type UseMagicLinkReturn = ReturnType<typeof useMagicLink>;
