import type { NextFunction, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model";
import type { RequestUser } from "../types";
import ResponseStatus from "../types/response-codes";
import { decode } from "../utils/create-token";
import { UnauthorizedError } from "../utils/errors";

export default (req: RequestUser, res: Response, next: NextFunction) => {
	console.log("auth middleware");
	const token = req.cookies.session_token;
	if (!token) {
		res
			.status(ResponseStatus.UNAUTHORIZED.code)
			.send(ResponseStatus.UNAUTHORIZED.message);
		return;
	}
	const data = decode(token);
	if (!data) {
		res
			.status(ResponseStatus.UNAUTHORIZED.code)
			.send(ResponseStatus.UNAUTHORIZED.message);
		return;
	}

	User.findOne({ email: (data as JwtPayload).email })
		.then((user) => {
			if (!user) {
				throw new UnauthorizedError("Unauthorized");
			}
			// Convert Mongoose document to a plain object and ensure _id is a string
			req.user = {
				...user.toObject(),
				_id: user._id.toString()
			};
			next();
		})
		.catch((error) => {
			if (error instanceof UnauthorizedError) {
				res
					.status(ResponseStatus.UNAUTHORIZED.code)
					.send(ResponseStatus.UNAUTHORIZED.message);
				return;
			}
			res
				.status(ResponseStatus.INTERNAL_SERVER_ERROR.code)
				.send(ResponseStatus.INTERNAL_SERVER_ERROR.message);
			console.error(error);
		});
};
