import type { CookieOptions, Request, Response } from "express";
import { EnvConfig } from "../config/env.config";
import { stytchClient } from "../config/stytch";
import User from "../models/user.model";
import StatusCodes from "../types/response-codes";
import { code as createToken } from "../utils/create-token";

const cookieOptions: CookieOptions = {
	httpOnly: true,
	secure: EnvConfig().environment === "production",
	sameSite: "strict" as const,
	maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
};
class AuthController {
	login(req: Request, res: Response) {
		const email = req.body.email;
		console.log({ email });
		stytchClient.magicLinks.email
			.loginOrCreate({
				email: email,
			})
			.then((response) => {
				console.log({ response });
				res.json(response);
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
			.then(async (response) => {
				try {
					const email = response.user.emails[0].email;
					const user = await User.findOne({ email });
					if (!user) {
						const newUser = await User.create({
							email: email,
						});
						res
							.cookie("session_token", createToken({ email }), cookieOptions)
							.json({
								email: newUser.email,
							});
						return;
					}
					res
						.cookie("session_token", response.session_token, cookieOptions)
						.json({
							email: user.email,
						});
				} catch (err) {
					console.error(err);
					res
						.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
						.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
				}
			})
			.catch((err) => {
				console.error(err);
				res
					.status(StatusCodes.UNAUTHORIZED.code)
					.send(StatusCodes.UNAUTHORIZED.message);
			});
	}
}

/* 
res.cookie("stytch_session", response.session_token, {
					httpOnly: true,
					secure: EnvConfig().environment === "production",
					sameSite: "strict",
					maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
				});

				res.send(`Hello, ${response.user.emails[0].email}!`);
*/

export default new AuthController();
