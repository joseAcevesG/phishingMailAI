import {
	type ReactNode,
	createContext,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { setOnUnauthorized } from "../services/authHandler";
import type { APIAuth, AuthContextType, AuthState } from "../types";

// context for authentication state
export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

/**
 * The AuthProvider component provides authentication state and
 * login/logout functionality to the entire app. It wraps the
 * application in the AuthContext and periodically checks the
 * user's authentication status with the backend.
 *
 * Children of the AuthProvider will have access to the
 * authentication state and the validateStatus function.
 *
 * @param {ReactNode} children The children of the component.
 *
 * @returns {JSX.Element} The AuthProvider component.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [state, setState] = useState<AuthState>({
		isAuthenticated: true,
		userEmail: null,
		loading: true,
	});
	const navigate = useNavigate();
	const navigateRef = useRef(navigate);
	useEffect(() => {
		navigateRef.current = navigate;
	}, [navigate]);

	// Status check API call
	const { execute: fetchStatus } = useFetch<APIAuth>(
		{ url: "/api/auth/status", onUnauthorized: () => {} },
		false,
	);

	const validateStatus = useCallback(async (response: APIAuth) => {
		if (response.authenticated) {
			setState((prev) => ({
				...prev,
				isAuthenticated: true,
				userEmail: response.email,
			}));
			return;
		}
		setState((prev) => ({
			...prev,
			isAuthenticated: false,
			userEmail: null,
		}));
		navigateRef.current("/login", { replace: true });
	}, []);

	useEffect(() => {
		setOnUnauthorized(() => validateStatus({ authenticated: false }));
	}, [validateStatus]);

	// Periodic status fetch
	useEffect(() => {
		let isMounted = true;
		const checkStatus = async () => {
			if (!isMounted) return;
			setState((prev) => ({ ...prev, loading: true }));
			try {
				const result = await fetchStatus();
				if (result) validateStatus(result);
				else {
					setState((prev) => ({
						...prev,
						isAuthenticated: false,
						userEmail: null,
					}));
				}
			} catch {
				setState((prev) => ({
					...prev,
					isAuthenticated: false,
					userEmail: null,
				}));
			} finally {
				if (isMounted) setState((prev) => ({ ...prev, loading: false }));
			}
		};

		checkStatus();
		const id = setInterval(checkStatus, 5 * 60 * 1000);
		return () => {
			isMounted = false;
			clearInterval(id);
		};
	}, [fetchStatus, validateStatus]);

	return (
		<AuthContext.Provider value={{ ...state, validateStatus }}>
			{children}
		</AuthContext.Provider>
	);
};
