import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface Props {
	children: React.ReactNode;
}

/**
 * A route that redirects to `/login` if the user is not authenticated.
 *
 * This can be used to protect routes that should only be accessible when the user is logged in.
 *
 * @param children The component to render if the user is authenticated
 * @returns A React component
 */
const ProtectedRoute: React.FC<Props> = ({ children }) => {
	const { isAuthenticated } = useAuth();
	// If the user is not authenticated, redirect them to the login page
	// This is a client-side redirect, so it won't trigger a full page reload
	// and the user will be returned to the originally requested page after
	// they've logged in
	if (!isAuthenticated) {
		return <Navigate replace to="/login" />;
	}

	// If the user is authenticated, just render the requested component
	return <>{children}</>;
};

export default ProtectedRoute;
