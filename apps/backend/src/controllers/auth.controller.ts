import type { Request, Response } from "express";
import { authTypes } from "shared/auth-types";
import { StytchError } from "stytch";
import type { ZodIssue } from "zod";
import { stytchClient } from "../config/stytch";
import User from "../models/user.model";
import AuthSchema, {
	AuthCredentialsSchema,
	MailSchema,
} from "../schemas/auth.schema";
import { encrypt } from "../utils/encrypt-string";
import StatusCodes from "../utils/response-codes";
import {
	deleteAllAuthTokens,
	deleteAuthToken,
	issueAuthTokens,
	rotateAuthTokens,
	verifyAccessToken,
} from "../utils/token-service";

class AuthController {
	/**
	 * Handles errors from Stytch API calls and sends appropriate HTTP responses.
	 * @param err The error object thrown.
	 * @param res The Express response object.
	 */
	private handleStytchError(err: unknown, res: Response) {
		if (
			err instanceof StytchError &&
			err.status_code !== 429 &&
			err.status_code < 500
		) {
			res.status(err.status_code).json({
				message: err.error_message,
			});
			return;
		}
		res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
			message: StatusCodes.INTERNAL_SERVER_ERROR.message,
		});
		console.error(err);
	}

	signUp(req: Request, res: Response) {
		const result = AuthSchema.safeParse(req.body);
		if (!result.success) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: result.error.errors[0].message,
			});
			return;
		}
		const { email, type } = result.data;
		if (type === authTypes.passwordLogin) {
			const { password } = result.data;
			if (!password) {
				res.status(StatusCodes.BAD_REQUEST.code).json({
					message: "Password is required",
				});
				return;
			}
			stytchClient.passwords
				.create({
					email: email,
					password: password,
				})
				.then((response) => {
					const email = response.user.emails[0].email;
					return User.findOne({ email });
				})
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
					if (
						err instanceof StytchError &&
						err.error_type === "duplicate_email"
					) {
						res.status(StatusCodes.BAD_REQUEST.code).json({
							message:
								"Email already exists. Please use a different email or change your password.",
						});
						return;
					}
					this.handleStytchError(err, res);
				});
			return;
		}
		res.status(StatusCodes.BAD_REQUEST.code).json({
			message: "Unsupported auth type",
		});
	}

	login(req: Request, res: Response) {
		const result = AuthSchema.safeParse(req.body);
		if (!result.success) {
			const errors = result.error.errors as ZodIssue[];
			const firstError = errors[0];
			let message = firstError.message;
			if (firstError.code === "invalid_type") {
				message = `Missing required parameter: ${firstError.path[0]}`;
			}
			res.status(StatusCodes.BAD_REQUEST.code).json({ message });
			return;
		}
		const { email, type } = result.data;
		if (type === authTypes.magicLink) {
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
					this.handleStytchError(err, res);
				});
			return;
		}
		if (type === authTypes.passwordLogin) {
			const { password } = result.data;
			if (!password) {
				res.status(StatusCodes.BAD_REQUEST.code).json({
					message: "Password is required",
				});
				return;
			}
			const params = {
				email: email,
				password: password,
			};
			stytchClient.passwords
				.authenticate(params)
				.then((response) => {
					const email = response.user.emails[0].email;
					return User.findOne({ email });
				})
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
					this.handleStytchError(err, res);
				});
			return;
		}
		res.status(StatusCodes.BAD_REQUEST.code).json({
			message: "Unsupported auth type",
		});
	}

	resetPassword(req: Request, res: Response) {
		const result = MailSchema.safeParse(req.body);
		if (!result.success) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: result.error.errors[0].message,
			});
			return;
		}
		const { email } = result.data;
		stytchClient.passwords.email
			.resetStart({
				email,
			})
			.then(() => {
				res.json({
					message: "Password reset link sent successfully",
				});
			})
			.catch((err) => {
				this.handleStytchError(err, res);
			});
	}

	authenticate(req: Request, res: Response) {
		const token = req.query.token as string;
		const tokenType = req.query.stytch_token_type as string;
		if (tokenType === authTypes.magicLink || tokenType === authTypes.login) {
			if (!token) {
				res.status(StatusCodes.BAD_REQUEST.code).json({
					message: "Token is required",
				});
				return;
			}

			let email: string;
			stytchClient.magicLinks
				.authenticate({
					token: token,
					session_duration_minutes: 60,
				})
				.then((response) => {
					email = response.user.emails[0].email;
					return User.findOne({ email });
				})
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
					this.handleStytchError(err, res);
				});

			return;
		}
		if (tokenType === authTypes.passwordReset) {
			const result = AuthCredentialsSchema.safeParse(req.body);
			if (!result.success) {
				res.status(StatusCodes.BAD_REQUEST.code).json({
					message: result.error.errors[0].message,
				});
				return;
			}
			const { password } = result.data;
			const params = {
				token: token,
				password: password,
			};
			stytchClient.passwords.email
				.reset(params)
				.then(() => {
					res.json({
						message: "Password reset successfully",
					});
				})
				.catch((err) => {
					this.handleStytchError(err, res);
				});
			return;
		}
		res.status(StatusCodes.BAD_REQUEST.code).json({
			message: "Unsupported token type",
		});
	}

	logout(req: Request, res: Response) {
		const refreshToken = req.tokenRotated
			? req.newRefreshToken
			: req.cookies.refresh_token;

		if (!refreshToken) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: StatusCodes.UNAUTHORIZED.message,
			});
			return;
		}
		if (!req.user?._id) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: StatusCodes.UNAUTHORIZED.message,
			});
			return;
		}
		deleteAuthToken(req.user._id, refreshToken)
			.then(() => {
				res.clearCookie("session_token").clearCookie("refresh_token").json({
					message: "Logged out successfully",
				});
			})
			.catch((err) => {
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: StatusCodes.INTERNAL_SERVER_ERROR.message,
				});
				console.error(err);
			});
	}

	logoutAll(req: Request, res: Response) {
		const userId = req.user?._id;
		if (!userId) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: StatusCodes.UNAUTHORIZED.message,
			});
			return;
		}
		deleteAllAuthTokens(userId)
			.then(() => {
				res.clearCookie("session_token").clearCookie("refresh_token").json({
					message: "Logged out from all sessions",
				});
			})
			.catch((error) => {
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: StatusCodes.INTERNAL_SERVER_ERROR.message,
				});
				console.error(error);
			});
	}

	changeTrial(req: Request, res: Response) {
		const { api_key } = req.body;

		if (!api_key) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "API key is required",
			});
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
					res.status(StatusCodes.NOT_FOUND.code).json({
						message: "User not found",
					});
					return;
				}

				res.json({
					message: "API key updated successfully",
				});
			})
			.catch((error: Error) => {
				console.error('changeTrial error:', error); // Added detailed error logging
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: StatusCodes.INTERNAL_SERVER_ERROR.message,
				});
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
