import type { Request } from "express";

export type InputToken = {
	email: string;
};

export interface User {
	_id?: string;
	email: string;
	api_key?: string | null;
	freeTrial: boolean;
	usageFreeTrial: number;
}

export interface RequestUser extends Request {
	user?: User;
}
