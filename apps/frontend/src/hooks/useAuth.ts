import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { APIMessage, AuthState } from "../types";
import type { APIAuth } from "../types";
import { useFetch } from "./useFetch";

export const useAuth = () => {
	const [state, setState] = useState<AuthState>({
		isAuthenticated: true,
		userEmail: null,
		loading: true,
	});
	const navigate = useNavigate();

	const { execute: executeLogout } = useFetch<APIMessage>(
		{
			url: "/api/auth/logout",
			method: "POST",
		},
		false,
	);

	const handleLogout = useCallback(async () => {
		const result = await executeLogout();
		if (result !== null) {
			setState((prev) => ({
				...prev,
				isAuthenticated: false,
				userEmail: null,
			}));
			navigate("/login", { replace: true });
		}
	}, [executeLogout, navigate]);

	const handleAuthenticate = useCallback((data: APIAuth) => {
		setState((prev) => ({
			...prev,
			isAuthenticated: data.authenticated,
			userEmail: data.email,
		}));
	}, []);

	const { execute: fetchStatus } = useFetch<APIAuth>(
		{
			url: "/api/auth/status",
		},
		false,
	);

	useEffect(() => {
		const handleStatus = async () => {
			setState((prev) => ({ ...prev, loading: true }));
			const result = await fetchStatus();
			if (result) {
				handleAuthenticate(result);
			} else {
				setState((prev) => ({
					...prev,
					isAuthenticated: false,
					userEmail: null,
				}));
			}
			setState((prev) => ({ ...prev, loading: false }));
		};
		handleStatus();
	}, [fetchStatus, handleAuthenticate]);

	return {
		...state,
		handleLogout,
		handleAuthenticate,
	};
};
