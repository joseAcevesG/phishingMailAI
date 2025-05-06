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

export interface APIMessage {
	message: string;
}

export interface APIAuth {
	authenticated: boolean;
	email?: string;
}

export interface FetchConfig {
	url: string;
	method?: string;
	headers?: HeadersInit;
	body?: unknown;
	credentials?: RequestCredentials;
}

export interface UseFetchReturn<T> {
	data: T | null;
	error: string | null;
	loading: boolean;
	execute: (configOverride?: Partial<FetchConfig>) => Promise<T | null>;
}
