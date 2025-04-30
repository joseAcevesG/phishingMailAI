import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { validateAll } from "../../services/validatePassword";
import type { APIMessage } from "../../types";

export function usePasswordReset() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const {
		error: fetchError,
		loading: isSubmitting,
		execute,
	} = useFetch<APIMessage>(
		{
			url: `/api/auth/authenticate?${searchParams.toString()}`,
			method: "POST",
		},
		false,
	);

	useEffect(() => {
		setValidationError(validateAll(password, confirmPassword));
	}, [password, confirmPassword]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await execute({ body: { password } });
		if (result) {
			navigate("/login");
		}
	};

	return {
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		validationError,
		fetchError,
		isSubmitting,
		handleSubmit,
	};
}
