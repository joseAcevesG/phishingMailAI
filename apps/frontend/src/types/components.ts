export interface HeaderProps {
	userEmail: string | null;
	onLogout: () => void;
}

export interface ProtectedRouteProps {
	children: React.ReactNode;
	isAuthenticated: boolean;
}

export interface LoginProps {
	isAuthenticated?: boolean;
}
