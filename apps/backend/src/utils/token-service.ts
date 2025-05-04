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

export function verifyAccessToken(token: string) {
	const data = readToken(token);
	if (!data) {
		return Promise.reject(new UnauthorizedError("Unauthorized"));
	}
	const email = (data as JwtPayload).email;
	return User.findOne({ email }).then((user) => {
		if (!user) throw new UnauthorizedError("Unauthorized");
		return user;
	});
}

export function rotateAuthTokens(oldRefreshToken: string, res: Response) {
	return RefreshTokenModel.findOne({ tokens: oldRefreshToken })
		.then((tokenDoc) => {
			if (!tokenDoc) throw new UnauthorizedError("Unauthorized");
			return User.findById(tokenDoc.user).then((user) => {
				if (!user) throw new UnauthorizedError("Unauthorized");
				const newRefreshToken = crypto.randomBytes(64).toString("hex");
				tokenDoc.tokens = tokenDoc.tokens.filter((t) => t !== oldRefreshToken);
				tokenDoc.tokens.push(newRefreshToken);
				return tokenDoc.save().then(() => ({ user, newRefreshToken }));
			});
		})
		.then(({ user, newRefreshToken }) => {
			const newAccessToken = createToken({ email: user.email });
			res.cookie("session_token", newAccessToken, {
				...cookieOptions,
				maxAge: ACCESS_TOKEN_EXPIRATION,
			});
			res.cookie("refresh_token", newRefreshToken, {
				...cookieOptions,
				maxAge: REFRESH_TOKEN_EXPIRATION,
			});
			return { user, newRefreshToken };
		});
}

export function issueAuthTokens(
	res: Response,
	email: string,
	userId: Types.ObjectId,
) {
	const accessToken = createToken({ email });
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

export function deleteAllAuthTokens(userId: Types.ObjectId | string) {
	return RefreshTokenModel.deleteOne({ user: userId });
}

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
