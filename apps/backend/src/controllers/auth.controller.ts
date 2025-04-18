import type { CookieOptions, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { z } from "zod";
import { EnvConfig } from "../config/env.config";
import { stytchClient } from "../config/stytch";
import User from "../models/user.model";
import type { RequestUser } from "../types";
import StatusCodes from "../types/response-codes";
import { code as createToken } from "../utils/create-token";
import { decode as decodeToken } from "../utils/create-token"; // Assuming the encrypt function is in this file
import { encrypt } from "../utils/encrypt-string";
const cookieOptions: CookieOptions = {
	httpOnly: true,
	secure: EnvConfig().environment === "production",
	sameSite: "strict" as const,
	maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
};
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
							return User.create({
								email: email,
							});
						}
						return Promise.resolve(user);
					})
					.then((user) => {
						res
							.cookie("session_token", createToken({ email }), cookieOptions)
							.json({
								authenticated: true,
								email: user.email,
							});
					})
					.catch((err) => {
						console.error(err);
						res
							.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
							.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
					});
			})
			.catch((err) => {
				console.error(err);
				res
					.status(StatusCodes.UNAUTHORIZED.code)
					.send(StatusCodes.UNAUTHORIZED.message);
			});
	}

	logout(_req: Request, res: Response) {
		res.clearCookie("session_token").send({
			message: "Logged out successfully",
		});
	}

	changeTrial(req: RequestUser, res: Response) {
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
		const token = req.cookies.session_token;

		if (!token) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				authenticated: false,
				email: undefined,
			});
			return;
		}

		try {
			const decoded = decodeToken(token);
			if (!decoded) {
				res.status(StatusCodes.UNAUTHORIZED.code).json({
					authenticated: false,
					email: undefined,
				});
				return;
			}
			res.json({
				authenticated: true,
				email: (decoded as JwtPayload).email,
			});
		} catch (err) {
			console.error("Error verifying token:", err);
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				authenticated: false,
				email: undefined,
			});
		}
	}
}

export default new AuthController();
