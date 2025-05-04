import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import type { APIAuth } from "../../types";

export interface UsePasswordLoginOptions {
	onAuthenticate: (data: APIAuth) => void;
	authType: string;
}

export function usePasswordLogin({
	onAuthenticate,
	authType,
}: UsePasswordLoginOptions) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const {
		error,
		loading: isSubmitting,
		execute,
	} = useFetch<APIAuth>(
		{
			url: "/api/auth/login",
			method: "POST",
			headers: { "Content-Type": "application/json" },
		},
		false,
	);
	const navigate = useNavigate();

	const handlePasswordLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await execute({
			body: { email, password, type: authType },
		});
		if (result) {
			onAuthenticate(result);
			navigate("/");
		}
	};

	return {
		email,
		setEmail,
		password,
		setPassword,
		error,
		isSubmitting,
		handlePasswordLogin,
	};
}
