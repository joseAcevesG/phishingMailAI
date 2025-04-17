import { Navigate } from "react-router-dom";

interface Props {
	children: React.ReactNode;
	isAuthenticated: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({
	children,
	isAuthenticated,
}) => {
	if (!isAuthenticated) {
		return <Navigate replace to="/login" />;
	}

	return <>{children}</>;
};
