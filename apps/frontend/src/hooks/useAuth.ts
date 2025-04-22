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
		const controller = new AbortController();
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
				signal: controller.signal,
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
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				// Fetch was aborted, do nothing
				return;
			}
			console.error("Logout failed:", error);
		}
		// Optionally return abort method for manual cancellation
		return () => controller.abort();
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
		const controller = new AbortController();
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/auth/status", {
					credentials: "include",
					signal: controller.signal,
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
				if (error instanceof DOMException && error.name === "AbortError") {
					// Fetch was aborted, do nothing
					return;
				}
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
		return () => {
			controller.abort();
		};
	}, []);

	return {
		...state,
		handleLogout,
		handleAuthenticate,
	};
};
