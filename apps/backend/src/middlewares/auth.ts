import type { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "../utils/errors";
import ResponseStatus from "../utils/response-codes";
import { rotateAuthTokens, verifyAccessToken } from "../utils/token-service";

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
				console.error(error);
				res.status(ResponseStatus.INTERNAL_SERVER_ERROR.code).json({
					message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
				});
			}
		});
}
