export interface AuthState {
	isAuthenticated: boolean;
	userEmail: string | null;
	loading: boolean;
}

export interface History {
	_id: string;
	subject: string;
	from: string;
	to: string;
}
