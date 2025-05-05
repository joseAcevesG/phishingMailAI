import type { authTypes } from "shared/auth-types";
import type { Analysis } from "shared/types";
import type { ResponseCodes } from "../utils/response-codes";

export interface InputToken {
	email: string;
	v?: number;
}

export interface User {
	readonly _id: string;
	email: string;
	api_key?: string | null;
	freeTrial: boolean;
	usageFreeTrial: number;
	analysis: Analysis[];
}

export type OpenAIResponse = Omit<Analysis, "_id">;

export interface Mail {
	subject: string;
	from: string;
	to: string;
	text: string;
	html: string;
}

export type ResponseCodeKeys = keyof typeof ResponseCodes;
export type ResponseCodeValues = (typeof ResponseCodes)[ResponseCodeKeys];

export type AuthType = keyof typeof authTypes;
