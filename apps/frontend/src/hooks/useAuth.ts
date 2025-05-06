import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { AuthContextType } from "../types";

/**
 * Hook to access the authentication state and login/logout functionality.
 *
 * The hook will throw an error if used outside of an AuthProvider.
 *
 * @returns The authentication state and login/logout functions.
 */
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
