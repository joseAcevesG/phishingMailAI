import type { Request } from "express";

export type InputToken = {
	email: string;
};

export interface User {
	email: string;
	api_key?: string | null;
	freeTrial: boolean;
	usageFreeTrial: number;
}

export interface RequestUser extends Request {
	user?: User;
}
