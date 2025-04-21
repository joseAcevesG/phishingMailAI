import type { Analysis } from "@shared/types";
import type { Request } from "express";
import type { ResponseCodes } from "../utils/response-codes";

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

// Extract types from the object
export type ResponseCodeKeys = keyof typeof ResponseCodes;
export type ResponseCodeValues = (typeof ResponseCodes)[ResponseCodeKeys];
