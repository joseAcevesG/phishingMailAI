import crypto from "node:crypto";
import type { Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";
import { EnvConfig } from "../config/env.config";
import RefreshTokenModel from "../models/refresh-token.model";
import User from "../models/user.model";
import { code as createToken, decode as readToken } from "./create-token";
import { UnauthorizedError } from "./errors";

const cookieOptions = {
	httpOnly: true,
	secure: EnvConfig().environment === "production",
	sameSite: "strict" as const,
};

const REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const ACCESS_TOKEN_EXPIRATION = 60 * 60 * 1000; // 1 hour

/**
 * Verifies an access token and retrieves the associated user.
 *
 * This function decodes the provided JWT access token to extract the user's email,
 * then searches the database for a user with that email. If the token is invalid
 * or if no user is found, an UnauthorizedError is returned.
 *
 * @param token - The JWT access token to verify.
 * @returns A promise that resolves with the user if the token is valid and the user exists,
 *          or rejects with an UnauthorizedError otherwise.
 */
export function verifyAccessToken(token: string) {
	const data = readToken(token);
	if (!data) {
		return Promise.reject(new UnauthorizedError("Unauthorized"));
	}
	const { email, v: tokenVersion } = data as JwtPayload;
	return User.findOne({ email }).then((user) => {
		if (!user) throw new UnauthorizedError("Unauthorized");
		if (
			typeof tokenVersion !== "number" ||
			user.token_version !== tokenVersion
		) {
			throw new UnauthorizedError("Token is stale. Please login again.");
		}
		return user;
	});
}

/**
 * Rotates the refresh token and issues a new access token.
 *
 * Finds the RefreshToken document associated with the provided old refresh token,
 * then finds the user associated with that document. If either of these lookups
 * fails, an UnauthorizedError is thrown.
 *
 * Generates a new refresh token and adds it to the RefreshToken document,
 * then saves the document. Finally, sets the new refresh token and a new access
 * token on the response object.
 *
 * @param oldRefreshToken - The old refresh token to rotate.
 * @param res - The Express response object.
 * @returns A promise that resolves with an object containing the user and new
 *          refresh token, or rejects with an UnauthorizedError if the lookup
 *          or save fails.
 */
export function rotateAuthTokens(oldRefreshToken: string, res: Response) {
	return (
		RefreshTokenModel.findOne({ tokens: oldRefreshToken })
			// find the refresh token document associated with the old refresh token
			.then((tokenDoc) => {
				if (!tokenDoc) throw new UnauthorizedError("Unauthorized");
				return User.findById(tokenDoc.user).then((user) => {
					// find the user associated with the refresh token document
					if (!user) throw new UnauthorizedError("Unauthorized");
					const newRefreshToken = crypto.randomBytes(64).toString("hex");
					tokenDoc.tokens = tokenDoc.tokens.filter(
						(t) => t !== oldRefreshToken,
					);
					tokenDoc.tokens.push(newRefreshToken);
					return tokenDoc.save().then(() => ({ user, newRefreshToken }));
				});
			})
			// set the new refresh token and a new access token on the response object
			.then(({ user, newRefreshToken }) => {
				const newAccessToken = createToken({
					email: user.email,
					v: user.token_version,
				});
				res.cookie("session_token", newAccessToken, {
					...cookieOptions,
					maxAge: ACCESS_TOKEN_EXPIRATION,
				});
				res.cookie("refresh_token", newRefreshToken, {
					...cookieOptions,
					maxAge: REFRESH_TOKEN_EXPIRATION,
				});
				return { user, newRefreshToken };
			})
	);
}

/**
 * Issues a new access token and refresh token for a user and sets them as
 * cookies on the response object.
 *
 * @param res - The Express response object.
 * @param email - The email of the user to issue tokens for.
 * @param userId - The MongoDB ObjectId of the user to issue tokens for.
 * @returns A promise that resolves with an object containing the new access
 *          token and refresh token.
 */
export function issueAuthTokens(
	res: Response,
	email: string,
	tokenVersion: number,
	userId: Types.ObjectId,
) {
	const accessToken = createToken({ email, v: tokenVersion });
	const refreshToken = crypto.randomBytes(64).toString("hex");
	return RefreshTokenModel.findOneAndUpdate(
		{ user: userId },
		{ $push: { tokens: refreshToken } },
		{ upsert: true },
	).then(() => {
		res.cookie("session_token", accessToken, {
			...cookieOptions,
			maxAge: ACCESS_TOKEN_EXPIRATION,
		});
		res.cookie("refresh_token", refreshToken, {
			...cookieOptions,
			maxAge: REFRESH_TOKEN_EXPIRATION,
		});
		return { accessToken, refreshToken };
	});
}

/**
 * Deletes all authentication tokens for a given user.
 *
 * @param userId - The MongoDB ObjectId or string value of the user to delete
 *                 tokens for.
 * @returns A promise that resolves when the tokens have been deleted.
 */
export function deleteAllAuthTokens(userId: Types.ObjectId | string) {
	return RefreshTokenModel.deleteOne({ user: userId });
}

/**
 * Deletes a specific authentication token for a given user.
 *
 * @param userId - The MongoDB ObjectId or string value of the user to delete
 *                 the token for.
 * @param refreshToken - The value of the refresh token to delete.
 * @returns A promise that resolves with the updated RefreshTokenModel document.
 */
export function deleteAuthToken(
	userId: Types.ObjectId | string,
	refreshToken: string,
) {
	return RefreshTokenModel.findOneAndUpdate(
		{ user: userId },
		{ $pull: { tokens: refreshToken } },
		{ new: true },
	);
}
