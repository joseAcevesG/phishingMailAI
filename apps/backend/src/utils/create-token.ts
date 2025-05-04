import jwt from "jsonwebtoken";
import { EnvConfig } from "../config/env.config";
import type { InputToken } from "../types";

/**
 * Generates a JSON Web Token (JWT) for the given input data.
 *
 * @param data - The input data to encode into the JWT.
 * @returns A string representing the signed JWT.
 */
export function code(data: InputToken): string {
	return jwt.sign(data, EnvConfig().tokenKey);
}

/**
 * Verifies a JSON Web Token (JWT) and returns the decoded data.
 *
 * @param token - The JWT to verify and decode.
 * @returns The decoded data if the token is valid, or `null` if the token is invalid.
 */
export function decode(token: string) {
	try {
		return jwt.verify(token, EnvConfig().tokenKey);
	} catch (_error) {
		return null;
	}
}
