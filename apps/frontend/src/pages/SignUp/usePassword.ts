import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authTypes } from "shared/auth-types";
import { useFetch } from "../../hooks/useFetch";
import { validateAll } from "../../services/validatePassword";
import type { APIAuth } from "../../types";

interface Props {
	onAuthenticate: (data: APIAuth) => void;
}

export function usePassword({ onAuthenticate }: Props) {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const {
		execute,
		error: fetchError,
		loading,
	} = useFetch<APIAuth>(
		{
			url: "/api/auth/signup",
			method: "POST",
		},
		false,
	);

	useEffect(() => {
		setError(validateAll(password, confirmPassword));
	}, [password, confirmPassword]);

	const handlePasswordSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		const result = await execute({
			body: { email, password, type: authTypes.passwordLogin },
		});
		if (result) {
			onAuthenticate(result);
			navigate("/");
		} else {
			setError(fetchError || "Signup failed. Please try again.");
		}
	};

	return {
		email,
		setEmail,
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		error,
		loading,
		handlePasswordSignUp,
	};
}
