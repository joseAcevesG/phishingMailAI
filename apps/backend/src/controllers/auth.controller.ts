import type { Request, Response } from "express";
import { authTypes } from "shared/auth-types";
import { StytchError } from "stytch";
import type { ZodIssue } from "zod";
import { EnvConfig } from "../config/env.config";
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

/**
 * Handles all authentication-related operations
 * @class AuthController
 */
class AuthController {
	/**
	 * Handles a Stytch error by sending a response to the client.
	 * If the error is a Stytch error with a status code below 500 and not equal to 429,
	 * it sends a response with the same status code and the error message.
	 * Otherwise, it sends a 500 response with a generic error message.
	 * If the environment is not "test", it also logs the error to the console.
	 * @param err The Stytch error to handle
	 * @param res The response to send
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
		if (EnvConfig().environment !== "test") console.error("Stytch error:", err);
	}

	/**
	 * Handles a sign up request.
	 * @param req The request containing the email address and password to sign up with
	 * @param res The response to send
	 */
	signUp(req: Request, res: Response) {
		const result = AuthSchema.safeParse(req.body);
		if (!result.success) {
			// Invalid signup data
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: result.error.errors[0].message,
			});
			return;
		}
		const { email, type } = result.data;
		if (type === authTypes.passwordLogin) {
			const { password } = result.data;
			if (!password) {
				// Password is required for password login
				res.status(StatusCodes.BAD_REQUEST.code).json({
					message: "Password is required",
				});
				return;
			}
			// Register user with Stytch and create user in DB if not exists
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
						// Email already exists
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
		// Only password login is supported
		res.status(StatusCodes.BAD_REQUEST.code).json({
			message: "Unsupported auth type",
		});
	}

	/**
	 * Logs in a user.
	 *
	 * @param req - The request containing the authentication information
	 * @param res - The response to return
	 *
	 * The request body should contain the following properties:
	 * - `email`: the email address of the user
	 * - `type`: the type of authentication to perform.
	 *   - `magicLink`: sends a magic link to the user's email
	 *   - `passwordLogin`: logs in the user using a password
	 * - `password`: the password of the user (required for `passwordLogin`)
	 *
	 * If the request is invalid, returns a 400 status code with an error
	 * message.
	 *
	 * If the authentication is successful, returns a 200 status code with
	 * the following properties:
	 * - `authenticated`: always `true`
	 * - `email`: the email address of the user
	 *
	 * If the authentication fails, returns a 401 status code with an error
	 * message.
	 */
	login(req: Request, res: Response) {
		const result = AuthSchema.safeParse(req.body);
		if (!result.success) {
			// Invalid login data
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
			// Send magic link to user
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
				// Password is required for password login
				res.status(StatusCodes.BAD_REQUEST.code).json({
					message: "Password is required",
				});
				return;
			}
			// Authenticate user with Stytch and issue tokens
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
		// Only magic link and password login are supported
		res.status(StatusCodes.BAD_REQUEST.code).json({
			message: "Unsupported auth type",
		});
	}

	/**
	 * Handles a password reset request.
	 * @param req The request containing the email address
	 * @param res The response to send
	 */
	resetPassword(req: Request, res: Response) {
		const result = MailSchema.safeParse(req.body);
		if (!result.success) {
			// Invalid email for password reset
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: result.error.errors[0].message,
			});
			return;
		}
		const { email } = result.data;
		// Start password reset flow with Stytch
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

	/**
	 * Authenticates a user based on the provided token and token type.
	 *
	 * This function handles three types of tokens:
	 * - `magicLink` and `login`: Authenticates a user using a magic link or login token.
	 *   Requires a valid token in the query parameters. If successful, issues authentication tokens and returns the authenticated email.
	 * - `passwordReset`: Resets the user's password using a token and new password from the request body.
	 *   Requires a valid token in the query parameters and a new password in the request body. If successful, confirms password reset.
	 *
	 * If the token type is unsupported or required parameters are missing, a 400 status code is returned with an appropriate error message.
	 *
	 * @param req - The Express request object containing query parameters and body data.
	 * @param res - The Express response object used to send back the HTTP response.
	 */
	authenticate(req: Request, res: Response) {
		const token = req.query.token as string;
		const tokenType = req.query.stytch_token_type as string;
		if (!token) {
			// Token is required for magic link/login
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "Token is required",
			});
			return;
		}
		if (tokenType === authTypes.magicLink || tokenType === authTypes.login) {
			let email: string;
			// Authenticate magic link/login token with Stytch
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
				// Invalid credentials for password reset
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
			// Reset password with Stytch
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
		// Only magic link, login, and password reset tokens are supported
		res.status(StatusCodes.BAD_REQUEST.code).json({
			message: "Unsupported token type",
		});
	}

	/**
	 * Log out user and clear cookies
	 * @param {Request} req Express request
	 * @param {Response} res Express response
	 * @description
	 * This endpoint logs out the user and clears the session and refresh tokens.
	 * If the user is not authenticated, it returns a 401 Unauthorized response.
	 * If there is an error deleting the auth token, it returns a 500 Internal Server Error response.
	 */
	logout(req: Request, res: Response) {
		const refreshToken = req.tokenRotated
			? req.newRefreshToken
			: req.cookies.refresh_token;

		if (!refreshToken) {
			// No refresh token present
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: StatusCodes.UNAUTHORIZED.message,
			});
			return;
		}
		if (!req.user?._id) {
			// User not authenticated
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: StatusCodes.UNAUTHORIZED.message,
			});
			return;
		}
		// Delete refresh token from DB and clear cookies
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
				if (EnvConfig().environment !== "test")
					console.error("Logout error:", err);
			});
	}

	/**
	 * Logs out the user from all sessions by deleting all authentication tokens.
	 * Clears the session and refresh tokens from cookies.
	 * Returns a 401 Unauthorized response if the user is not authenticated.
	 * Returns a 500 Internal Server Error response if there's an error during token deletion.
	 * @param {Request} req Express request
	 * @param {Response} res Express response
	 */
	logoutAll(req: Request, res: Response) {
		const userId = req.user?._id;
		if (!userId) {
			// User not authenticated
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: StatusCodes.UNAUTHORIZED.message,
			});
			return;
		}
		// Delete all refresh tokens for user and clear cookies
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
				if (EnvConfig().environment !== "test")
					console.error("Logout all error:", error);
			});
	}

	/**
	 * Changes the trial status of a user by updating the API key.
	 *
	 * If the API key is not provided in the request body, it returns a 400 Bad Request error.
	 * If the user is not found, it returns a 404 Not Found error.
	 * If there is an error during the update process, it returns a 500 Internal Server Error.
	 * On successful update, it disables the free trial and returns a success message.
	 *
	 * @param {Request} req - Express request object
	 * @param {Response} res - Express response object
	 */
	changeTrial(req: Request, res: Response) {
		const { api_key } = req.body;

		if (!api_key) {
			// API key is required
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "API key is required",
			});
			return;
		}

		// Encrypt and update API key, disable free trial
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
					// User not found
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
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: StatusCodes.INTERNAL_SERVER_ERROR.message,
				});
				if (EnvConfig().environment !== "test")
					console.error("Change trial error:", error);
			});
	}

	/**
	 * Checks if the user is authenticated and returns the user's email if so.
	 *
	 * Checks for the presence of a session token and verifies it. If the token is invalid,
	 * it tries to rotate the refresh token and verify the new session token. If both checks
	 * fail, it returns a 401 error with an empty email.
	 *
	 * @param req - The Express request object.
	 * @param res - The Express response object.
	 */
	status(req: Request, res: Response) {
		const accessToken = req.cookies.session_token;

		if (accessToken) {
			// Try to verify access token
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
			// No refresh token, not authenticated
			res
				.status(StatusCodes.UNAUTHORIZED.code)
				.json({ authenticated: false, email: undefined });
			return;
		}
		// Try to rotate tokens and verify user
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
