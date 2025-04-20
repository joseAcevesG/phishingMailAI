import type { Analysis } from "@shared/types";
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
	analysis: Analysis[];
}

export interface RequestUser extends Request {
	user?: User;
	tokenRotated?: boolean;
	newRefreshToken?: string;
}

export type OpenAIResponse = Omit<Analysis, "_id">;

export interface Mail {
	subject: string;
	from: string;
	to: string;
	text: string;
	html: string;
}
