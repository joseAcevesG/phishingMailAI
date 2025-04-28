import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { APIMessage, AuthState } from "../types";
import { useFetch } from "./useFetch";

export const useAuth = () => {
	const [state, setState] = useState<AuthState>({
		isAuthenticated: true,
		userEmail: null,
		loading: true,
	});
	const navigate = useNavigate();

	const { execute: executeLogout, error: logoutError } = useFetch<APIMessage>(
		{
			url: "/api/auth/logout",
			method: "POST",
			credentials: "include",
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
		} else if (logoutError) {
			console.error("Logout failed:", logoutError);
		}
	}, [executeLogout, navigate, logoutError]);

	const handleAuthenticate = useCallback(
		(data: { authenticated: boolean; email: string }) => {
			setState((prev) => ({
				...prev,
				isAuthenticated: data.authenticated,
				userEmail: data.email,
			}));
		},
		[],
	);

	const { execute: fetchStatus } = useFetch<{
		authenticated: boolean;
		email: string;
	}>(
		{
			url: "/api/auth/status",
			credentials: "include",
		},
		false,
	);

	useEffect(() => {
		setState((prev) => ({ ...prev, loading: true }));
		fetchStatus().then((result) => {
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
		});
	}, [fetchStatus, handleAuthenticate]);

	return {
		...state,
		handleLogout,
		handleAuthenticate,
	};
};
