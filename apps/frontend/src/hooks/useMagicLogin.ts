import { useEffect, useState } from "react";
import type { APIMessage } from "../types";
// removed unused useNavigate import
import { useFetch } from "./useFetch";

/**
 * Custom hook to handle resend cooldown logic for buttons.
 * @param initialCountdown The initial countdown value in seconds (default: 15)
 * @returns Object with email, setEmail, isButtonDisabled, setIsButtonDisabled, countdown, error, setError
 */
export function useMagicLogin(initialCountdown = 15) {
	const [email, setEmail] = useState("");
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [countdown, setCountdown] = useState(initialCountdown);
	const [inputError, setInputError] = useState<string | null>(null);

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

	const { execute, error: fetchError } = useFetch<APIMessage>(
		{
			url: "/api/auth/login",
			method: "POST",
		},
		false,
	);

	const handleMagicLinkRequest = async () => {
		if (!email) {
			setInputError("Please enter your email address");
			return;
		}

		setInputError(null);
		const result = await execute({ body: { type: "magic_links", email } });
		if (result) setIsButtonDisabled(true);
	};

	return {
		email,
		setEmail,
		isButtonDisabled,
		countdown,
		error: inputError || fetchError,
		setError: setInputError,
		handleMagicLinkRequest,
	};
}
