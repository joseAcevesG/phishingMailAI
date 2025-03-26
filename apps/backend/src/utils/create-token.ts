import jwt from "jsonwebtoken";
import { EnvConfig } from "../config/env.config";
import type { InputToken } from "../types";

export function code(data: InputToken): string {
	return jwt.sign(data, EnvConfig().tokenKey);
}

export function decode(token: string) {
	try {
		return jwt.verify(token, EnvConfig().tokenKey);
	} catch (_error) {
		return null;
	}
}
