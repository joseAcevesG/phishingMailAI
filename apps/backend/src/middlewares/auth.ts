import type { NextFunction, Request, Response } from "express";

import { EnvConfig } from "../config/env.config";
import { UnauthorizedError } from "../utils/errors";
import ResponseStatus from "../utils/response-codes";
import { rotateAuthTokens, verifyAccessToken } from "../utils/token-service";

/**
 * Middleware to authenticate a user based on session and refresh tokens.
 *
 * Checks for a session token in the request cookies and attempts to verify it.
 * If verification succeeds, the user is attached to the request object and the
 * next middleware is called. If verification fails or if no session token is
 * found, a refresh token process is initiated.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the stack.
 */
export default (req: Request, res: Response, next: NextFunction) => {
	const accessToken = req.cookies.session_token;
	if (accessToken) {
		verifyAccessToken(accessToken)
			.then((user) => {
				req.user = { ...user.toObject(), _id: user._id.toString() };
				next();
			})
			.catch(() => processRefresh(req, res, next));
	} else {
		processRefresh(req, res, next);
	}
};

/**
 * Processes a refresh token rotation.
 *
 * If no refresh token is found in the request cookies, a 401 Unauthorized response
 * is sent.
 *
 * If a refresh token is found, the `rotateAuthTokens` function is called
 * and the response and next middleware are passed to it.
 *
 * If the `rotateAuthTokens` function succeeds, the user and new refresh token are stored in the request
 * object and the next middleware is called.
 *
 * If the `rotateAuthTokens` function throws an error, the error is caught and a 401 Unauthorized
 * response or a 500 Internal Server Error response is sent depending on the type of error.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the stack.
 */
function processRefresh(req: Request, res: Response, next: NextFunction) {
	const refreshToken = req.cookies.refresh_token;
	if (!refreshToken) {
		res.status(ResponseStatus.UNAUTHORIZED.code).json({
			message: ResponseStatus.UNAUTHORIZED.message,
		});
		return;
	}
	rotateAuthTokens(refreshToken, res)
		.then(({ user, newRefreshToken }) => {
			req.user = { ...user.toObject(), _id: user._id.toString() };
			// flag that a rotation happened
			req.tokenRotated = true;
			req.newRefreshToken = newRefreshToken;
			next();
		})
		.catch((error) => {
			if (error instanceof UnauthorizedError) {
				res.status(ResponseStatus.UNAUTHORIZED.code).json({
					message: ResponseStatus.UNAUTHORIZED.message,
				});
			} else {
				res.status(ResponseStatus.INTERNAL_SERVER_ERROR.code).json({
					message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
				});
				if (EnvConfig().environment !== "test")
					console.error("Rotate auth tokens error:", error);
			}
		});
}
