import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthState } from "../types";

export const useAuth = () => {
	const [state, setState] = useState<AuthState>({
		isAuthenticated: true,
		userEmail: null,
		loading: true,
	});
	const navigate = useNavigate();

	const handleLogout = useCallback(async () => {
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			if (response.ok) {
				setState((prev) => ({
					...prev,
					isAuthenticated: false,
					userEmail: null,
				}));
				navigate("/login");
				return;
			}
			console.error("Logout failed");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	}, [navigate]);

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

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/auth/status", {
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					setState((prev) => ({
						...prev,
						isAuthenticated: data.authenticated,
						userEmail: data.email,
						loading: false,
					}));
				} else {
					setState((prev) => ({
						...prev,
						isAuthenticated: false,
						userEmail: null,
						loading: false,
					}));
				}
			} catch (error) {
				console.error("Auth check failed:", error);
				setState((prev) => ({
					...prev,
					isAuthenticated: false,
					userEmail: null,
					loading: false,
				}));
			}
		};

		checkAuth();
	}, []);

	return {
		...state,
		handleLogout,
		handleAuthenticate,
	};
};
