import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import type { APIAuth } from "../../types";

export function useAuthenticate(onAuthenticate: (data: APIAuth) => void) {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { execute } = useFetch<APIAuth>(
		{ url: "/api/auth/authenticate", method: "POST" },
		false,
	);

	useEffect(() => {
		const queryString = searchParams.toString();
		const handleAuthenticate = () => {
			execute({
				url: `/api/auth/authenticate?${queryString}`,
			})
				.then((result) => {
					if (result) onAuthenticate(result);
					else navigate("/login");
				})
				.catch(() => {
					navigate("/login");
				});
		};

		if (!queryString) {
			navigate("/login");
			return;
		}

		handleAuthenticate();
	}, [execute, navigate, onAuthenticate, searchParams]);
}
