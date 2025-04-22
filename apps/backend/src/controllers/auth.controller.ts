import type { Request, Response } from "express";
import { StytchError } from "stytch";
import { z } from "zod";
// Removed unused EnvConfig import
import { stytchClient } from "../config/stytch";
import User from "../models/user.model";
import { encrypt } from "../utils/encrypt-string";
import StatusCodes from "../utils/response-codes";
import {
	deleteAllAuthTokens,
	deleteAuthToken,
	issueAuthTokens,
	rotateAuthTokens,
	verifyAccessToken,
} from "../utils/token-service";

const emailSchema = z.object({
	email: z.string().email("Invalid email format"),
});

class AuthController {
	login(req: Request, res: Response) {
		const result = emailSchema.safeParse(req.body);
		if (!result.success) {
			res
				.status(StatusCodes.BAD_REQUEST.code)
				.send(result.error.errors[0].message);
			return;
		}
		const { email } = result.data;
		stytchClient.magicLinks.email
			.loginOrCreate({
				email: email,
			})
			.then(() => {
				res.json({
					message: "Magic link sent successfully",
				});
			})
			.catch((err) => {
				console.error(err);
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
			});
	}

	authenticate(req: Request, res: Response) {
		const token = req.query.token as string;
		const tokenType = req.query.stytch_token_type as string;
		if (tokenType !== "magic_links") {
			console.error(`Unsupported token type: '${tokenType}'`);
			res.status(StatusCodes.BAD_REQUEST.code).send("Unsupported token type");
			return;
		}

		if (!token) {
			res.status(StatusCodes.BAD_REQUEST.code).send("Token is required");
			return;
		}

		stytchClient.magicLinks
			.authenticate({
				token: token,
				session_duration_minutes: 60,
			})
			.then((response) => {
				const email = response.user.emails[0].email;
				User.findOne({ email })
					.then((user) => {
						if (!user) {
							return User.create({ email });
						}
						return user;
					})
					.then((user) => {
						return issueAuthTokens(res, email, user._id);
					})
					.then(() => {
						res.json({ authenticated: true, email });
					})
					.catch((err) => {
						console.error(err);
						res
							.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
							.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
					});
			})
			.catch((err) => {
				if (
					err instanceof StytchError &&
					err.status_code !== 429 &&
					err.status_code < 500
				) {
					res
						.status(StatusCodes.UNAUTHORIZED.code)
						.send(StatusCodes.UNAUTHORIZED.message);
					return;
				}
				console.error(err);
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
			});
	}

	logout(req: Request, res: Response) {
		const refreshToken = req.tokenRotated
			? req.newRefreshToken
			: req.cookies.refresh_token;

		if (!refreshToken) {
			res
				.status(StatusCodes.UNAUTHORIZED.code)
				.send(StatusCodes.UNAUTHORIZED.message);
			return;
		}
		if (!req.user?._id) {
			res
				.status(StatusCodes.UNAUTHORIZED.code)
				.send(StatusCodes.UNAUTHORIZED.message);
			return;
		}
		deleteAuthToken(req.user._id, refreshToken)
			.then(() => {
				res.clearCookie("session_token").clearCookie("refresh_token").send({
					message: "Logged out successfully",
				});
			})
			.catch((err) => {
				console.error(err);
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
			});
	}

	logoutAll(req: Request, res: Response) {
		const userId = req.user?._id;
		if (!userId) {
			res
				.status(StatusCodes.UNAUTHORIZED.code)
				.send(StatusCodes.UNAUTHORIZED.message);
			return;
		}
		deleteAllAuthTokens(userId)
			.then(() => {
				res.clearCookie("session_token").clearCookie("refresh_token").json({
					message: "Logged out from all sessions",
				});
			})
			.catch((error) => {
				console.error(error);
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
			});
	}

	changeTrial(req: Request, res: Response) {
		const { api_key } = req.body;

		if (!api_key) {
			res.status(StatusCodes.BAD_REQUEST.code).send("API key is required");
			return;
		}

		encrypt(api_key)
			.then((encryptedApiKey: string) => {
				return User.findOneAndUpdate(
					{ _id: req.user?._id },
					{
						api_key: encryptedApiKey,
						freeTrial: false,
					},
					{ new: true },
				);
			})
			.then((user) => {
				if (!user) {
					res.status(StatusCodes.NOT_FOUND.code).send("User not found");
					return;
				}

				res.json({
					message: "API key updated successfully",
				});
			})
			.catch((error: Error) => {
				console.error(error);
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
			});
	}

	status(req: Request, res: Response) {
		const accessToken = req.cookies.session_token;

		if (accessToken) {
			verifyAccessToken(accessToken)
				.then((user) => res.json({ authenticated: true, email: user.email }))
				.catch(() =>
					res
						.status(StatusCodes.UNAUTHORIZED.code)
						.json({ authenticated: false, email: undefined }),
				);
			return;
		}
		const refreshToken = req.cookies.refresh_token;
		if (!refreshToken) {
			res
				.status(StatusCodes.UNAUTHORIZED.code)
				.json({ authenticated: false, email: undefined });
			return;
		}
		rotateAuthTokens(refreshToken, res)
			.then(({ user }) => {
				res.json({ authenticated: true, email: user.email });
			})
			.catch(() => {
				res
					.status(StatusCodes.UNAUTHORIZED.code)
					.json({ authenticated: false, email: undefined });
			});
	}
}

export default new AuthController();
