import { Navigate } from "react-router-dom";
import type { ProtectedRouteProps } from "../types/components";

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	isAuthenticated,
}) => {
	if (!isAuthenticated) {
		return <Navigate replace to="/login" />;
	}

	return <>{children}</>;
};
